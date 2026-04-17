<template>
  <div class="admin-elderly-page">
    <AppHeader title="老人管理" />
    <AdminNav />

    <div class="admin-container">
      <!-- 页面标题区 -->
      <div class="page-hero">
        <div class="hero-content">
          <h1 class="hero-title">
            <IconSvg name="users" :size="32" />
            <span>老人档案管理</span>
          </h1>
          <p class="hero-subtitle">管理社区老人信息，维护健康档案数据</p>
        </div>
        <div class="hero-stats">
          <div class="stat-item">
            <div class="stat-value">{{ elderlyList.length }}</div>
            <div class="stat-label">总老人数</div>
          </div>
          <div class="stat-item active">
            <div class="stat-value">{{ activeCount }}</div>
            <div class="stat-label">活跃状态</div>
          </div>
        </div>
      </div>

      <!-- 操作栏 -->
      <div class="action-bar">
        <div class="search-section">
          <div class="search-box">
            <IconSvg name="search" :size="18" class="search-icon" />
            <input
              v-model="searchKeyword"
              type="text"
              placeholder="搜索姓名、电话或ID..."
              class="search-input"
              @keyup.enter="handleSearch"
            />
            <button v-if="searchKeyword" class="clear-btn" @click="searchKeyword = ''">
              <IconSvg name="x" :size="16" />
            </button>
          </div>
        </div>
        <div class="action-buttons">
          <button class="btn btn-secondary" @click="exportData">
            <IconSvg name="download" :size="18" />
            <span>导出数据</span>
          </button>
          <button class="btn btn-primary" @click="openAddElderlyModal">
            <IconSvg name="plus" :size="18" />
            <span>新增老人</span>
          </button>
        </div>
      </div>

      <!-- 老人卡片网格 -->
      <div class="elderly-grid">
        <div
          v-for="elderly in filteredElderlyList"
          :key="elderly.id"
          class="elderly-card"
          :class="{ 'inactive': elderly.status === 'inactive' }"
        >
          <div class="card-header">
            <div class="avatar">
              <IconSvg :name="elderly.gender === '男' ? 'user' : 'user'" :size="32" />
            </div>
            <div class="header-info">
              <h3 class="name">{{ elderly.name }}</h3>
              <span class="id">ID: {{ elderly.id }}</span>
            </div>
            <div class="status-badge" :class="elderly.status">
              {{ elderly.status === 'active' ? '活跃' : '禁用' }}
            </div>
          </div>

          <div class="card-body">
            <div class="info-grid">
              <div class="info-item">
                <span class="label">年龄</span>
                <span class="value">{{ elderly.age }}岁</span>
              </div>
              <div class="info-item">
                <span class="label">性别</span>
                <span class="value">{{ elderly.gender }}</span>
              </div>
              <div class="info-item">
                <span class="label">电话</span>
                <span class="value">{{ elderly.phone }}</span>
              </div>
              <div class="info-item">
                <span class="label">家属</span>
                <span class="value">{{ elderly.familyName || '未绑定' }}</span>
              </div>
            </div>
            <div class="address-row">
              <IconSvg name="location" :size="14" />
              <span>{{ elderly.address || '未填写地址' }}</span>
            </div>
          </div>

          <div class="card-footer">
            <button class="action-btn view" @click="viewElderlyDetail(elderly.id)">
              <IconSvg name="eye" :size="16" />
              <span>详情</span>
            </button>
            <button class="action-btn edit" @click="openEditElderlyModal(elderly)">
              <IconSvg name="edit" :size="16" />
              <span>编辑</span>
            </button>
            <button class="action-btn delete" @click="deleteElderly(elderly.id)">
              <IconSvg name="trash" :size="16" />
              <span>删除</span>
            </button>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="filteredElderlyList.length === 0" class="empty-state">
        <div class="empty-illustration">
          <IconSvg name="users" :size="80" />
        </div>
        <h3>暂无老人信息</h3>
        <p>点击下方按钮添加第一位老人</p>
        <button class="btn btn-primary" @click="openAddElderlyModal">
          <IconSvg name="plus" :size="18" />
          <span>新增老人</span>
        </button>
      </div>

      <!-- 分页 -->
      <div v-if="totalPages > 1" class="pagination-wrapper">
        <div class="pagination">
          <button
            class="page-btn"
            :disabled="currentPage === 1"
            @click="prevPage"
          >
            <IconSvg name="arrow-left" :size="16" />
          </button>
          <div class="page-numbers">
            <button
              v-for="page in displayedPages"
              :key="page"
              class="page-number"
              :class="{ active: page === currentPage }"
              @click="currentPage = page"
            >
              {{ page }}
            </button>
          </div>
          <button
            class="page-btn"
            :disabled="currentPage === totalPages"
            @click="nextPage"
          >
            <IconSvg name="arrow-right" :size="16" />
          </button>
        </div>
        <span class="page-info">共 {{ totalItems }} 条，{{ totalPages }} 页</span>
      </div>
    </div>

    <!-- 新增/编辑弹窗 -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showElderlyModal" class="modal-overlay" @click.self="closeElderlyModal">
          <div class="modal-panel">
            <div class="modal-header">
              <div class="header-icon" :class="isEditing ? 'edit' : 'add'">
                <IconSvg :name="isEditing ? 'edit' : 'plus'" :size="24" />
              </div>
              <h3>{{ isEditing ? '编辑老人信息' : '新增老人' }}</h3>
              <button class="close-btn" @click="closeElderlyModal">
                <IconSvg name="x" :size="20" />
              </button>
            </div>
            <div class="modal-body">
              <form @submit.prevent="saveElderly">
                <div class="form-section">
                  <h4 class="section-title">基本信息</h4>
                  <div class="form-grid">
                    <div class="form-field">
                      <label>姓名 <span class="required">*</span></label>
                      <input v-model="formData.name" type="text" required placeholder="请输入姓名" />
                    </div>
                    <div class="form-field">
                      <label>年龄 <span class="required">*</span></label>
                      <input v-model.number="formData.age" type="number" required min="60" max="120" placeholder="60-120" />
                    </div>
                    <div class="form-field">
                      <label>性别 <span class="required">*</span></label>
                      <select v-model="formData.gender" required>
                        <option value="">请选择</option>
                        <option value="男">男</option>
                        <option value="女">女</option>
                      </select>
                    </div>
                    <div class="form-field">
                      <label>联系电话 <span class="required">*</span></label>
                      <input v-model="formData.phone" type="tel" required placeholder="11位手机号" />
                    </div>
                  </div>
                </div>

                <div class="form-section">
                  <h4 class="section-title">住址信息</h4>
                  <div class="form-field full">
                    <label>详细地址</label>
                    <input v-model="formData.address" type="text" placeholder="请输入详细居住地址" />
                  </div>
                </div>

                <div class="form-section">
                  <h4 class="section-title">家属信息</h4>
                  <div class="form-grid">
                    <div class="form-field">
                      <label>家属姓名</label>
                      <input v-model="formData.familyName" type="text" placeholder="可选填" />
                    </div>
                    <div class="form-field">
                      <label>家属电话</label>
                      <input v-model="formData.familyPhone" type="tel" placeholder="可选填" />
                    </div>
                  </div>
                </div>

                <div class="form-section">
                  <h4 class="section-title">健康信息</h4>
                  <div class="form-field full">
                    <label>慢性病</label>
                    <div class="checkbox-group">
                      <label v-for="disease in chronicDiseaseOptions" :key="disease" class="checkbox-item">
                        <input
                          type="checkbox"
                          :value="disease"
                          v-model="formData.chronicDiseases"
                        />
                        <span>{{ disease }}</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div class="form-section">
                  <h4 class="section-title">账号状态</h4>
                  <div class="form-field">
                    <div class="radio-group">
                      <label class="radio-item">
                        <input type="radio" v-model="formData.status" value="active" />
                        <span class="radio-label active">活跃</span>
                      </label>
                      <label class="radio-item">
                        <input type="radio" v-model="formData.status" value="inactive" />
                        <span class="radio-label inactive">禁用</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div class="modal-footer">
                  <button type="button" class="btn btn-secondary" @click="closeElderlyModal">取消</button>
                  <button type="submit" class="btn btn-primary">
                    <IconSvg :name="isEditing ? 'check' : 'plus'" :size="18" />
                    <span>{{ isEditing ? '保存修改' : '确认添加' }}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- 详情弹窗 -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showDetailModal" class="modal-overlay" @click.self="closeDetailModal">
          <div class="modal-panel detail-panel">
            <div class="modal-header">
              <div class="header-icon info">
                <IconSvg name="user" :size="24" />
              </div>
              <h3>老人详细信息</h3>
              <button class="close-btn" @click="closeDetailModal">
                <IconSvg name="x" :size="20" />
              </button>
            </div>
            <div class="modal-body" v-if="selectedElderly">
              <div class="detail-profile">
                <div class="profile-avatar">
                  <IconSvg name="user" :size="48" />
                </div>
                <div class="profile-info">
                  <h4>{{ selectedElderly.name }}</h4>
                  <span class="profile-id">ID: {{ selectedElderly.id }}</span>
                  <span class="status-badge" :class="selectedElderly.status">
                    {{ selectedElderly.status === 'active' ? '活跃' : '禁用' }}
                  </span>
                </div>
              </div>

              <div class="detail-sections">
                <div class="detail-section">
                  <h5>基本信息</h5>
                  <div class="detail-grid">
                    <div class="detail-item">
                      <span class="label">年龄</span>
                      <span class="value">{{ selectedElderly.age }}岁</span>
                    </div>
                    <div class="detail-item">
                      <span class="label">性别</span>
                      <span class="value">{{ selectedElderly.gender }}</span>
                    </div>
                    <div class="detail-item">
                      <span class="label">电话</span>
                      <span class="value">{{ selectedElderly.phone }}</span>
                    </div>
                  </div>
                </div>

                <div class="detail-section">
                  <h5>住址</h5>
                  <p class="detail-text">{{ selectedElderly.address || '未填写' }}</p>
                </div>

                <div class="detail-section">
                  <h5>家属信息</h5>
                  <div class="detail-grid">
                    <div class="detail-item">
                      <span class="label">姓名</span>
                      <span class="value">{{ selectedElderly.familyName || '未绑定' }}</span>
                    </div>
                    <div class="detail-item">
                      <span class="label">电话</span>
                      <span class="value">{{ selectedElderly.familyPhone || '未填写' }}</span>
                    </div>
                  </div>
                </div>

                <div class="detail-section" v-if="selectedElderly.chronicDiseases?.length">
                  <h5>慢性病</h5>
                  <div class="tag-list">
                    <span v-for="disease in selectedElderly.chronicDiseases" :key="disease" class="tag">
                      {{ disease }}
                    </span>
                  </div>
                </div>
              </div>

              <div class="modal-footer">
                <button class="btn btn-secondary" @click="closeDetailModal">关闭</button>
                <button class="btn btn-primary" @click="openEditFromDetail">编辑信息</button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import AppHeader from '../components/AppHeader.vue';
import AdminNav from '../components/AdminNav.vue';
import IconSvg from '../components/IconSvg.vue';

// 数据
const elderlyList = ref([]);
const searchKeyword = ref('');
const currentPage = ref(1);
const pageSize = ref(8);
const showElderlyModal = ref(false);
const showDetailModal = ref(false);
const isEditing = ref(false);

const chronicDiseaseOptions = ['高血压', '糖尿病', '心脏病', '哮喘', '关节炎', '阿尔茨海默症', '帕金森', '其他'];

const formData = ref({
  id: '',
  name: '',
  age: '',
  gender: '',
  phone: '',
  address: '',
  familyName: '',
  familyPhone: '',
  chronicDiseases: [],
  status: 'active'
});

const selectedElderly = ref(null);

// 计算属性
const activeCount = computed(() => elderlyList.value.filter(e => e.status === 'active').length);

const filteredList = computed(() => {
  if (!searchKeyword.value) return elderlyList.value;
  const keyword = searchKeyword.value.toLowerCase();
  return elderlyList.value.filter(elderly => {
    const idMatch = elderly.id ? String(elderly.id).includes(keyword) : false;
    return elderly.name?.toLowerCase().includes(keyword) ||
           elderly.phone?.includes(keyword) ||
           idMatch;
  });
});

const totalItems = computed(() => filteredList.value.length);
const totalPages = computed(() => Math.ceil(totalItems.value / pageSize.value));

const filteredElderlyList = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredList.value.slice(start, end);
});

const displayedPages = computed(() => {
  const pages = [];
  const maxDisplay = 5;
  let start = Math.max(1, currentPage.value - Math.floor(maxDisplay / 2));
  let end = Math.min(totalPages.value, start + maxDisplay - 1);

  if (end - start + 1 < maxDisplay) {
    start = Math.max(1, end - maxDisplay + 1);
  }

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }
  return pages;
});

// 生命周期
onMounted(() => {
  fetchElderlyList();
});

// 方法
const fetchElderlyList = () => {
  const saved = localStorage.getItem('adminElderlyList');
  if (saved) {
    elderlyList.value = JSON.parse(saved);
  } else {
    // 初始化模拟数据
    const mockData = [
      { id: 1001, name: '张三', age: 78, gender: '男', phone: '13800138001', address: '北京市朝阳区建国路88号', familyName: '张小明', familyPhone: '13900139001', chronicDiseases: ['高血压', '糖尿病'], status: 'active' },
      { id: 1002, name: '李四', age: 82, gender: '女', phone: '13800138002', address: '北京市朝阳区亚运村街道', familyName: '李小红', familyPhone: '13900139002', chronicDiseases: ['心脏病'], status: 'active' },
      { id: 1003, name: '王五', age: 75, gender: '男', phone: '13800138003', address: '北京市海淀区中关村大街', familyName: '王大伟', familyPhone: '13900139003', chronicDiseases: ['关节炎'], status: 'inactive' },
      { id: 1004, name: '赵六', age: 85, gender: '女', phone: '13800138004', address: '北京市西城区金融街', familyName: '赵小军', familyPhone: '13900139004', chronicDiseases: ['阿尔茨海默症'], status: 'active' },
      { id: 1005, name: '钱七', age: 72, gender: '男', phone: '13800138005', address: '北京市东城区王府井', familyName: '钱小丽', familyPhone: '13900139005', chronicDiseases: [], status: 'active' },
    ];
    elderlyList.value = mockData;
    saveToStorage();
  }
};

const saveToStorage = () => {
  localStorage.setItem('adminElderlyList', JSON.stringify(elderlyList.value));
  // 同步到家属端的老人列表
  localStorage.setItem('elderlyList', JSON.stringify(elderlyList.value.map(e => ({
    id: e.id ? String(e.id) : '',
    name: e.name,
    age: e.age,
    gender: e.gender,
    relationship: e.familyName ? '亲属' : '未绑定',
    chronicDiseases: e.chronicDiseases || [],
    deviceStatus: e.status === 'active' ? 'online' : 'offline',
    bindDate: '2024-01-01',
    lastHealthCheck: new Date().toISOString().split('T')[0]
  }))));
};

const handleSearch = () => {
  currentPage.value = 1;
};

const prevPage = () => {
  if (currentPage.value > 1) currentPage.value--;
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) currentPage.value++;
};

const openAddElderlyModal = () => {
  isEditing.value = false;
  formData.value = {
    id: '',
    name: '',
    age: '',
    gender: '',
    phone: '',
    address: '',
    familyName: '',
    familyPhone: '',
    chronicDiseases: [],
    status: 'active'
  };
  showElderlyModal.value = true;
};

const openEditElderlyModal = (elderly) => {
  isEditing.value = true;
  formData.value = {
    ...elderly,
    chronicDiseases: elderly.chronicDiseases || []
  };
  showElderlyModal.value = true;
};

const closeElderlyModal = () => {
  showElderlyModal.value = false;
};

const saveElderly = () => {
  if (isEditing.value) {
    const index = elderlyList.value.findIndex(e => e.id === formData.value.id);
    if (index !== -1) {
      elderlyList.value[index] = { ...formData.value };
    }
  } else {
    const newElderly = {
      ...formData.value,
      id: Date.now()
    };
    elderlyList.value.unshift(newElderly);
  }
  saveToStorage();
  closeElderlyModal();
};

const deleteElderly = (id) => {
  if (confirm('确定要删除这位老人的信息吗？此操作不可恢复。')) {
    elderlyList.value = elderlyList.value.filter(e => e.id !== id);
    saveToStorage();
  }
};

const viewElderlyDetail = (id) => {
  const elderly = elderlyList.value.find(e => e.id === id);
  if (elderly) {
    selectedElderly.value = { ...elderly };
    showDetailModal.value = true;
  }
};

const closeDetailModal = () => {
  showDetailModal.value = false;
  selectedElderly.value = null;
};

const openEditFromDetail = () => {
  closeDetailModal();
  openEditElderlyModal(selectedElderly.value);
};

const exportData = () => {
  const data = JSON.stringify(elderlyList.value, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `老人数据_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
};
</script>

<style scoped lang="scss">
.admin-elderly-page {
  min-height: 100vh;
  background: #f8fafc;
}

.admin-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px;
}

// 页面标题区
.page-hero {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32px;
  background: linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%);
  border-radius: 20px;
  color: white;
  margin-bottom: 24px;
  box-shadow: 0 10px 40px rgba(30, 58, 95, 0.3);

  .hero-content {
    .hero-title {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 28px;
      font-weight: 700;
      margin: 0 0 8px;

      :deep(svg) {
        opacity: 0.9;
      }
    }

    .hero-subtitle {
      font-size: 15px;
      opacity: 0.8;
      margin: 0;
    }
  }

  .hero-stats {
    display: flex;
    gap: 24px;

    .stat-item {
      text-align: center;
      padding: 16px 24px;
      background: rgba(255, 255, 255, 0.12);
      border-radius: 16px;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);

      &.active {
        background: rgba(16, 185, 129, 0.25);
      }

      .stat-value {
        font-size: 32px;
        font-weight: 700;
        line-height: 1;
        margin-bottom: 4px;
      }

      .stat-label {
        font-size: 13px;
        opacity: 0.8;
      }
    }
  }
}

// 操作栏
.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  gap: 16px;
  flex-wrap: wrap;

  .search-section {
    flex: 1;
    min-width: 280px;
    max-width: 400px;

    .search-box {
      position: relative;
      display: flex;
      align-items: center;

      .search-icon {
        position: absolute;
        left: 16px;
        color: #94a3b8;
      }

      .search-input {
        width: 100%;
        padding: 12px 44px;
        border: 2px solid #e2e8f0;
        border-radius: 12px;
        font-size: 15px;
        transition: all 0.2s ease;
        background: white;

        &:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        &::placeholder {
          color: #94a3b8;
        }
      }

      .clear-btn {
        position: absolute;
        right: 12px;
        background: none;
        border: none;
        color: #94a3b8;
        cursor: pointer;
        padding: 4px;
        border-radius: 50%;
        transition: all 0.2s ease;

        &:hover {
          background: #f1f5f9;
          color: #64748b;
        }
      }
    }
  }

  .action-buttons {
    display: flex;
    gap: 12px;

    .btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 20px;
      border-radius: 12px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      border: none;

      &.btn-primary {
        background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
        color: white;
        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
        }
      }

      &.btn-secondary {
        background: white;
        color: #374151;
        border: 2px solid #e5e7eb;

        &:hover {
          border-color: #d1d5db;
          background: #f9fafb;
        }
      }
    }
  }
}

// 老人卡片网格
.elderly-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
}

.elderly-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  transition: all 0.3s ease;
  border: 1px solid #e2e8f0;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12);
  }

  &.inactive {
    opacity: 0.7;
    .card-header .avatar {
      background: #e5e7eb;
      color: #9ca3af;
    }
  }

  .card-header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 20px;
    border-bottom: 1px solid #f1f5f9;

    .avatar {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
      color: #2563eb;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .header-info {
      flex: 1;

      .name {
        font-size: 17px;
        font-weight: 600;
        color: #1f2937;
        margin: 0 0 2px;
      }

      .id {
        font-size: 12px;
        color: #9ca3af;
      }
    }

    .status-badge {
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 500;

      &.active {
        background: #dcfce7;
        color: #166534;
      }

      &.inactive {
        background: #f3f4f6;
        color: #6b7280;
      }
    }
  }

  .card-body {
    padding: 16px 20px;

    .info-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
      margin-bottom: 12px;

      .info-item {
        display: flex;
        flex-direction: column;
        gap: 2px;

        .label {
          font-size: 12px;
          color: #9ca3af;
        }

        .value {
          font-size: 14px;
          color: #374151;
          font-weight: 500;
        }
      }
    }

    .address-row {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      color: #6b7280;
      padding-top: 12px;
      border-top: 1px solid #f3f4f6;

      :deep(svg) {
        flex-shrink: 0;
        color: #9ca3af;
      }

      span {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  }

  .card-footer {
    display: flex;
    padding: 12px 20px;
    background: #f8fafc;
    border-top: 1px solid #f1f5f9;
    gap: 8px;

    .action-btn {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 8px 12px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      border: none;
      background: transparent;
      color: #6b7280;

      &:hover {
        background: white;
      }

      &.view:hover {
        color: #3b82f6;
        box-shadow: 0 2px 8px rgba(59, 130, 246, 0.15);
      }

      &.edit:hover {
        color: #10b981;
        box-shadow: 0 2px 8px rgba(16, 185, 129, 0.15);
      }

      &.delete:hover {
        color: #ef4444;
        box-shadow: 0 2px 8px rgba(239, 68, 68, 0.15);
      }
    }
  }
}

// 空状态
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 24px;
  text-align: center;

  .empty-illustration {
    width: 120px;
    height: 120px;
    border-radius: 32px;
    background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #94a3b8;
    margin-bottom: 24px;
  }

  h3 {
    font-size: 20px;
    font-weight: 600;
    color: #374151;
    margin: 0 0 8px;
  }

  p {
    font-size: 15px;
    color: #9ca3af;
    margin: 0 0 24px;
  }
}

// 分页
.pagination-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;

  .pagination {
    display: flex;
    align-items: center;
    gap: 8px;

    .page-btn {
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid #e5e7eb;
      border-radius: 10px;
      background: white;
      color: #6b7280;
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover:not(:disabled) {
        border-color: #3b82f6;
        color: #3b82f6;
      }

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }

    .page-numbers {
      display: flex;
      gap: 6px;

      .page-number {
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 1px solid #e5e7eb;
        border-radius: 10px;
        background: white;
        color: #374151;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;

        &:hover {
          border-color: #3b82f6;
          color: #3b82f6;
        }

        &.active {
          background: #3b82f6;
          border-color: #3b82f6;
          color: white;
        }
      }
    }
  }

  .page-info {
    font-size: 13px;
    color: #9ca3af;
  }
}

// 弹窗样式
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 24px;
}

.modal-panel {
  background: white;
  border-radius: 20px;
  width: 100%;
  max-width: 560px;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);

  &.detail-panel {
    max-width: 480px;
  }

  .modal-header {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 24px;
    border-bottom: 1px solid #e5e7eb;

    .header-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;

      &.add {
        background: #dbeafe;
        color: #2563eb;
      }

      &.edit {
        background: #d1fae5;
        color: #059669;
      }

      &.info {
        background: #dbeafe;
        color: #2563eb;
      }
    }

    h3 {
      flex: 1;
      font-size: 18px;
      font-weight: 600;
      color: #1f2937;
      margin: 0;
    }

    .close-btn {
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: none;
      background: #f3f4f6;
      border-radius: 10px;
      color: #6b7280;
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        background: #e5e7eb;
        color: #374151;
      }
    }
  }

  .modal-body {
    padding: 24px;
    overflow-y: auto;
    max-height: calc(90vh - 180px);

    .form-section {
      margin-bottom: 24px;

      &:last-of-type {
        margin-bottom: 0;
      }

      .section-title {
        font-size: 14px;
        font-weight: 600;
        color: #374151;
        margin: 0 0 16px;
        padding-bottom: 8px;
        border-bottom: 1px solid #e5e7eb;
      }
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
    }

    .form-field {
      &.full {
        grid-column: 1 / -1;
      }

      label {
        display: block;
        font-size: 13px;
        font-weight: 500;
        color: #374151;
        margin-bottom: 6px;

        .required {
          color: #ef4444;
        }
      }

      input, select {
        width: 100%;
        padding: 10px 14px;
        border: 1px solid #d1d5db;
        border-radius: 10px;
        font-size: 14px;
        transition: all 0.2s ease;

        &:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        &::placeholder {
          color: #9ca3af;
        }
      }

      .checkbox-group {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;

        .checkbox-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 14px;
          color: #4b5563;
          cursor: pointer;

          input[type="checkbox"] {
            width: 18px;
            height: 18px;
            cursor: pointer;
          }
        }
      }

      .radio-group {
        display: flex;
        gap: 16px;

        .radio-item {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;

          input[type="radio"] {
            width: 18px;
            height: 18px;
            cursor: pointer;
          }

          .radio-label {
            padding: 6px 16px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 500;

            &.active {
              background: #dcfce7;
              color: #166534;
            }

            &.inactive {
              background: #f3f4f6;
              color: #6b7280;
            }
          }
        }
      }
    }
  }

  .modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    padding: 20px 24px;
    border-top: 1px solid #e5e7eb;
    background: #f9fafb;

    .btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 20px;
      border-radius: 10px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      border: none;

      &.btn-secondary {
        background: white;
        color: #4b5563;
        border: 1px solid #d1d5db;

        &:hover {
          background: #f9fafb;
          border-color: #9ca3af;
        }
      }

      &.btn-primary {
        background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
        color: white;
        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);

        &:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
        }
      }
    }
  }
}

// 详情面板特殊样式
.detail-profile {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: #f8fafc;
  border-radius: 16px;
  margin-bottom: 24px;

  .profile-avatar {
    width: 72px;
    height: 72px;
    border-radius: 50%;
    background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
    color: #2563eb;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .profile-info {
    h4 {
      font-size: 20px;
      font-weight: 600;
      color: #1f2937;
      margin: 0 0 4px;
    }

    .profile-id {
      display: block;
      font-size: 13px;
      color: #9ca3af;
      margin-bottom: 8px;
    }

    .status-badge {
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 500;

      &.active {
        background: #dcfce7;
        color: #166534;
      }

      &.inactive {
        background: #f3f4f6;
        color: #6b7280;
      }
    }
  }
}

.detail-sections {
  .detail-section {
    margin-bottom: 20px;
    padding-bottom: 20px;
    border-bottom: 1px solid #e5e7eb;

    &:last-child {
      border-bottom: none;
      margin-bottom: 0;
      padding-bottom: 0;
    }

    h5 {
      font-size: 13px;
      font-weight: 600;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin: 0 0 12px;
    }

    .detail-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;

      .detail-item {
        display: flex;
        flex-direction: column;
        gap: 2px;

        .label {
          font-size: 12px;
          color: #9ca3af;
        }

        .value {
          font-size: 15px;
          color: #374151;
          font-weight: 500;
        }
      }
    }

    .detail-text {
      font-size: 15px;
      color: #374151;
      margin: 0;
    }

    .tag-list {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;

      .tag {
        padding: 6px 12px;
        background: #fef3c7;
        color: #92400e;
        border-radius: 8px;
        font-size: 13px;
        font-weight: 500;
      }
    }
  }
}

// 弹窗动画
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;

  .modal-panel {
    transition: transform 0.3s ease, opacity 0.3s ease;
  }
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;

  .modal-panel {
    transform: scale(0.95);
    opacity: 0;
  }
}

// 响应式
@media (max-width: 768px) {
  .admin-container {
    padding: 16px;
  }

  .page-hero {
    flex-direction: column;
    gap: 20px;
    text-align: center;
    padding: 24px;

    .hero-title {
      font-size: 22px;
      justify-content: center;
    }

    .hero-stats {
      width: 100%;
      justify-content: center;
    }
  }

  .action-bar {
    flex-direction: column;

    .search-section {
      max-width: 100%;
      width: 100%;
    }
  }

  .elderly-grid {
    grid-template-columns: 1fr;
  }

  .modal-panel {
    margin: 16px;
  }

  .form-grid {
    grid-template-columns: 1fr !important;
  }
}
</style>