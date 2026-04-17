<template>
  <div class="admin-warning">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <button class="btn btn-secondary back-btn" @click="router.push('/admin/dashboard')">
          <IconSvg name="arrow-left" :size="16" />
          <span>返回</span>
        </button>
        <h1>预警记录管理</h1>
      </div>
      <div class="header-actions">
        <div class="filter-box">
          <select v-model="selectedStatus" class="filter-select">
            <option value="">所有状态</option>
            <option value="pending">未处理</option>
            <option value="processing">处理中</option>
            <option value="completed">已处理</option>
            <option value="dismissed">已忽略</option>
          </select>
          <select v-model="selectedLevel" class="filter-select">
            <option value="">所有等级</option>
            <option value="low">低</option>
            <option value="medium">中</option>
            <option value="high">高</option>
            <option value="critical">紧急</option>
          </select>
          <button class="btn btn-secondary" @click="handleFilter">筛选</button>
        </div>
        <button class="btn btn-primary" @click="exportWarnings">
          <IconSvg name="download" :size="16" />
          <span>导出记录</span>
        </button>
      </div>
    </div>

    <!-- 预警概览 -->
    <div class="warning-overview">
      <div class="overview-card">
        <div class="card-icon">
          <IconSvg name="warning" :size="32" />
        </div>
        <div class="card-content">
          <h3>总预警数</h3>
          <p class="card-value">{{ totalWarnings }}</p>
          <p class="card-desc">全部预警记录</p>
        </div>
      </div>
      <div class="overview-card">
        <div class="card-icon danger">
          <IconSvg name="alert-circle" :size="32" />
        </div>
        <div class="card-content">
          <h3>未处理</h3>
          <p class="card-value">{{ pendingWarnings }}</p>
          <p class="card-desc">待处理预警</p>
        </div>
      </div>
      <div class="overview-card">
        <div class="card-icon warning">
          <IconSvg name="alert-triangle" :size="32" />
        </div>
        <div class="card-content">
          <h3>处理中</h3>
          <p class="card-value">{{ processingWarnings }}</p>
          <p class="card-desc">处理中预警</p>
        </div>
      </div>
      <div class="overview-card">
        <div class="card-icon success">
          <IconSvg name="check-circle" :size="32" />
        </div>
        <div class="card-content">
          <h3>已处理</h3>
          <p class="card-value">{{ completedWarnings }}</p>
          <p class="card-desc">已完成处理</p>
        </div>
      </div>
    </div>

    <!-- 预警列表 -->
    <div class="warning-list">
      <div class="list-header">
        <div class="list-item">
          <div class="col col-id">ID</div>
          <div class="col col-time">时间</div>
          <div class="col col-elderly">老人</div>
          <div class="col col-type">类型</div>
          <div class="col col-level">等级</div>
          <div class="col col-content">内容</div>
          <div class="col col-status">状态</div>
          <div class="col col-handler">处理人</div>
          <div class="col col-actions">操作</div>
        </div>
      </div>
      <div class="list-body">
        <div 
          v-for="warning in filteredWarnings" 
          :key="warning.id"
          class="list-item"
        >
          <div class="col col-id">{{ warning.id }}</div>
          <div class="col col-time">{{ warning.time }}</div>
          <div class="col col-elderly">{{ warning.elderlyName }}</div>
          <div class="col col-type">{{ warning.type }}</div>
          <div class="col col-level">
            <span 
              class="level-badge"
              :class="{
                'level-low': warning.level === 'low',
                'level-medium': warning.level === 'medium',
                'level-high': warning.level === 'high',
                'level-critical': warning.level === 'critical'
              }"
            >
              {{ warning.level === 'low' ? '低' : warning.level === 'medium' ? '中' : warning.level === 'high' ? '高' : '紧急' }}
            </span>
          </div>
          <div class="col col-content">{{ warning.content }}</div>
          <div class="col col-status">
            <span 
              class="status-badge"
              :class="{
                'status-pending': warning.status === 'pending',
                'status-processing': warning.status === 'processing',
                'status-completed': warning.status === 'completed',
                'status-dismissed': warning.status === 'dismissed'
              }"
            >
              {{ warning.status === 'pending' ? '未处理' : warning.status === 'processing' ? '处理中' : warning.status === 'completed' ? '已处理' : '已忽略' }}
            </span>
          </div>
          <div class="col col-handler">{{ warning.handler || '未处理' }}</div>
          <div class="col col-actions">
            <button class="btn btn-sm btn-info" @click="viewWarningDetail(warning.id)">详情</button>
            <button 
              v-if="warning.status === 'pending'"
              class="btn btn-sm btn-primary" 
              @click="startProcessing(warning.id)"
            >
              开始处理
            </button>
            <button 
              v-if="warning.status === 'processing'"
              class="btn btn-sm btn-success" 
              @click="completeProcessing(warning.id)"
            >
              完成处理
            </button>
            <button 
              class="btn btn-sm btn-danger" 
              @click="dismissWarning(warning.id)"
            >
              忽略
            </button>
          </div>
        </div>
      </div>
      <!-- 空状态 -->
      <div v-if="filteredWarnings.length === 0" class="empty-state">
        <div class="empty-icon">
          <IconSvg name="bell" :size="48" />
        </div>
        <p>暂无预警记录</p>
      </div>
    </div>

    <!-- 分页 -->
    <div class="pagination" v-if="filteredWarnings.length > 0">
      <button class="page-btn" @click="prevPage" :disabled="currentPage === 1">上一页</button>
      <span class="page-info">第 {{ currentPage }} 页，共 {{ totalPages }} 页</span>
      <button class="page-btn" @click="nextPage" :disabled="currentPage === totalPages">下一页</button>
    </div>

    <!-- 预警详情弹窗 -->
    <div v-if="showDetailModal" class="modal-overlay" @click="closeDetailModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>预警详情</h3>
          <button class="modal-close" @click="closeDetailModal">×</button>
        </div>
        <div class="modal-body">
          <div v-if="selectedWarning" class="warning-detail">
            <div class="detail-row">
              <label>预警ID:</label>
              <span>{{ selectedWarning.id }}</span>
            </div>
            <div class="detail-row">
              <label>发生时间:</label>
              <span>{{ selectedWarning.time }}</span>
            </div>
            <div class="detail-row">
              <label>老人姓名:</label>
              <span>{{ selectedWarning.elderlyName }}</span>
            </div>
            <div class="detail-row">
              <label>预警类型:</label>
              <span>{{ selectedWarning.type }}</span>
            </div>
            <div class="detail-row">
              <label>预警等级:</label>
              <span>
                <span 
                  class="level-badge"
                  :class="{
                    'level-low': selectedWarning.level === 'low',
                    'level-medium': selectedWarning.level === 'medium',
                    'level-high': selectedWarning.level === 'high',
                    'level-critical': selectedWarning.level === 'critical'
                  }"
                >
                  {{ selectedWarning.level === 'low' ? '低' : selectedWarning.level === 'medium' ? '中' : selectedWarning.level === 'high' ? '高' : '紧急' }}
                </span>
              </span>
            </div>
            <div class="detail-row">
              <label>预警内容:</label>
              <span>{{ selectedWarning.content }}</span>
            </div>
            <div class="detail-row">
              <label>当前状态:</label>
              <span>
                <span 
                  class="status-badge"
                  :class="{
                    'status-pending': selectedWarning.status === 'pending',
                    'status-processing': selectedWarning.status === 'processing',
                    'status-completed': selectedWarning.status === 'completed',
                    'status-dismissed': selectedWarning.status === 'dismissed'
                  }"
                >
                  {{ selectedWarning.status === 'pending' ? '未处理' : selectedWarning.status === 'processing' ? '处理中' : selectedWarning.status === 'completed' ? '已处理' : '已忽略' }}
                </span>
              </span>
            </div>
            <div class="detail-row">
              <label>处理人:</label>
              <span>{{ selectedWarning.handler || '未处理' }}</span>
            </div>
            <div class="detail-row">
              <label>处理时间:</label>
              <span>{{ selectedWarning.processTime || '未处理' }}</span>
            </div>
            <div class="detail-row detail-notes">
              <label>处理备注:</label>
              <textarea 
                v-model="selectedWarning.notes"
                class="notes-input"
                placeholder="请输入处理备注"
              ></textarea>
            </div>
            <div class="detail-actions">
              <button class="btn btn-secondary" @click="closeDetailModal">关闭</button>
              <button class="btn btn-primary" @click="saveWarningDetail">保存备注</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import IconSvg from '../components/IconSvg.vue';

// 路由实例
const router = useRouter();

// 响应式数据
const warningList = ref([]);
const selectedStatus = ref('');
const selectedLevel = ref('');
const currentPage = ref(1);
const pageSize = ref(10);
const showDetailModal = ref(false);
const selectedWarning = ref(null);

// 计算属性：过滤后的预警列表
const filteredWarnings = computed(() => {
  let filtered = warningList.value;
  if (selectedStatus.value) {
    filtered = filtered.filter(w => w.status === selectedStatus.value);
  }
  if (selectedLevel.value) {
    filtered = filtered.filter(w => w.level === selectedLevel.value);
  }
  // 分页处理
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filtered.slice(start, end);
});

// 计算属性：总页数
const totalPages = computed(() => {
  let filtered = warningList.value;
  if (selectedStatus.value) {
    filtered = filtered.filter(w => w.status === selectedStatus.value);
  }
  if (selectedLevel.value) {
    filtered = filtered.filter(w => w.level === selectedLevel.value);
  }
  return Math.ceil(filtered.length / pageSize.value);
});

// 计算属性：总预警数
const totalWarnings = computed(() => warningList.value.length);

// 计算属性：未处理预警数
const pendingWarnings = computed(() => warningList.value.filter(w => w.status === 'pending').length);

// 计算属性：处理中预警数
const processingWarnings = computed(() => warningList.value.filter(w => w.status === 'processing').length);

// 计算属性：已处理预警数
const completedWarnings = computed(() => warningList.value.filter(w => w.status === 'completed').length);

// 生命周期：组件挂载时获取预警数据
onMounted(() => {
  fetchWarnings();
});

// 方法：获取预警数据
const fetchWarnings = () => {
  // 从localStorage中获取老人列表
  const savedElderlyList = localStorage.getItem('elderlyList');
  const elderlyMap = {};
  
  if (savedElderlyList) {
    const elderlyData = JSON.parse(savedElderlyList);
    elderlyData.forEach(elderly => {
      elderlyMap[elderly.id] = elderly.name;
    });
  }
  
  // 模拟API请求
  setTimeout(() => {
    const baseWarnings = [
      { id: 1, time: '2024-01-20 08:30', elderlyId: 1, type: '心率异常', level: 'high', content: '心率持续高于100bpm', status: 'pending', handler: '', processTime: '', notes: '' },
      { id: 2, time: '2024-01-20 09:15', elderlyId: 2, type: '血压异常', level: 'medium', content: '血压偏高', status: 'processing', handler: '管理员A', processTime: '', notes: '' },
      { id: 3, time: '2024-01-20 10:00', elderlyId: 3, type: '睡眠不足', level: 'low', content: '睡眠时长少于6小时', status: 'completed', handler: '管理员B', processTime: '2024-01-20 10:30', notes: '已联系家属' },
      { id: 4, time: '2024-01-20 11:45', elderlyId: 4, type: '体温异常', level: 'critical', content: '体温高于38.5°C', status: 'pending', handler: '', processTime: '', notes: '' },
      { id: 5, time: '2024-01-20 12:30', elderlyId: 5, type: '活动减少', level: 'medium', content: '今日步数少于1000步', status: 'dismissed', handler: '管理员A', processTime: '2024-01-20 13:00', notes: '老人休息中，属正常情况' },
      { id: 6, time: '2024-01-20 14:15', elderlyId: 1, type: '心率异常', level: 'medium', content: '心率波动较大', status: 'pending', handler: '', processTime: '', notes: '' },
      { id: 7, time: '2024-01-20 15:00', elderlyId: 2, type: '血压异常', level: 'high', content: '血压持续升高', status: 'processing', handler: '管理员B', processTime: '', notes: '' },
      { id: 8, time: '2024-01-20 16:45', elderlyId: 3, type: '睡眠异常', level: 'low', content: '夜间醒来次数过多', status: 'completed', handler: '管理员A', processTime: '2024-01-20 17:00', notes: '已调整睡眠环境' },
      { id: 9, time: '2024-01-20 17:30', elderlyId: 4, type: '体温异常', level: 'high', content: '体温持续升高', status: 'pending', handler: '', processTime: '', notes: '' },
      { id: 10, time: '2024-01-20 18:15', elderlyId: 5, type: '活动异常', level: 'medium', content: '长时间无活动', status: 'pending', handler: '', processTime: '', notes: '' }
    ];
    
    // 根据老人列表更新预警数据中的老人名称
    warningList.value = baseWarnings.map(warning => ({
      ...warning,
      elderlyName: elderlyMap[warning.elderlyId] || warning.elderlyName
    }));
  }, 300);
};

// 方法：筛选预警
const handleFilter = () => {
  currentPage.value = 1;
  // 重新获取最新的预警数据
  fetchWarnings();
};

// 方法：导出预警记录
const exportWarnings = () => {
  alert('预警记录导出功能已触发');
};

// 方法：查看预警详情
const viewWarningDetail = (id) => {
  const warning = warningList.value.find(w => w.id === id);
  if (warning) {
    selectedWarning.value = { ...warning };
    showDetailModal.value = true;
  }
};

// 方法：关闭详情弹窗
const closeDetailModal = () => {
  showDetailModal.value = false;
  selectedWarning.value = null;
};

// 方法：保存预警详情
const saveWarningDetail = () => {
  if (selectedWarning.value) {
    const index = warningList.value.findIndex(w => w.id === selectedWarning.value.id);
    if (index !== -1) {
      warningList.value[index] = { ...selectedWarning.value };
    }
    closeDetailModal();
  }
};

// 方法：开始处理预警
const startProcessing = (id) => {
  const index = warningList.value.findIndex(w => w.id === id);
  if (index !== -1) {
    warningList.value[index].status = 'processing';
    warningList.value[index].handler = '当前管理员';
  }
};

// 方法：完成处理预警
const completeProcessing = (id) => {
  const index = warningList.value.findIndex(w => w.id === id);
  if (index !== -1) {
    warningList.value[index].status = 'completed';
    warningList.value[index].processTime = new Date().toLocaleString();
  }
};

// 方法：忽略预警
const dismissWarning = (id) => {
  if (confirm('确定要忽略这条预警吗？')) {
    const index = warningList.value.findIndex(w => w.id === id);
    if (index !== -1) {
      warningList.value[index].status = 'dismissed';
      warningList.value[index].handler = '当前管理员';
      warningList.value[index].processTime = new Date().toLocaleString();
    }
  }
};

// 方法：上一页
const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
};

// 方法：下一页
const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
};
</script>

<style scoped lang="scss">
.admin-warning {
  padding: 24px;
  background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
  min-height: 100vh;

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 28px;
    padding-bottom: 20px;
    border-bottom: 1px solid #e2e8f0;

    .header-left {
      display: flex;
      align-items: center;
      gap: 15px;

      .back-btn {
        display: flex;
        align-items: center;
        gap: 5px;
        padding: 8px 15px;

        .btn-icon {
          font-size: 16px;
        }
      }

      h1 {
        font-size: 24px;
        font-weight: 700;
        color: #1e293b;
        margin: 0;
      }
    }

    .header-actions {
      display: flex;
      gap: 15px;
      align-items: center;

      .filter-box {
        display: flex;
        gap: 10px;
        align-items: center;

        .filter-select {
          padding: 10px 15px;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          font-size: 14px;
          min-width: 120px;
          background: white;
          color: #1e293b;

          &:focus {
            outline: none;
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
          }
        }
      }
    }
  }

  .warning-overview {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
    margin-bottom: 28px;

    .overview-card {
      background: white;
      border-radius: 16px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
      padding: 24px;
      display: flex;
      align-items: center;
      gap: 16px;
      transition: transform 0.3s ease, box-shadow 0.3s ease;

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1);
      }

      .card-icon {
        width: 64px;
        height: 64px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, #dbeafe, #bfdbfe);
        color: #3b82f6;
        border-radius: 50%;
        flex-shrink: 0;

        &.danger {
          background: linear-gradient(135deg, #fee2e2, #fecaca);
          color: #dc2626;
        }

        &.warning {
          background: linear-gradient(135deg, #fef3c7, #fde68a);
          color: #d97706;
        }

        &.success {
          background: linear-gradient(135deg, #dcfce7, #bbf7d0);
          color: #16a34a;
        }
      }

      .card-content {
        flex: 1;

        h3 {
          font-size: 14px;
          font-weight: 500;
          color: #64748b;
          margin: 0 0 8px 0;
        }

        .card-value {
          font-size: 28px;
          font-weight: 700;
          color: #1e293b;
          margin: 0 0 4px 0;
          line-height: 1.1;
        }

        .card-desc {
          font-size: 12px;
          color: #64748b;
          margin: 0;
        }
      }
    }
  }

  .warning-list {
    background: white;
    border-radius: 16px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
    overflow: hidden;

    .list-header {
      background: #f8fafc;
      border-bottom: 1px solid #e2e8f0;

      .list-item {
        display: flex;
        padding: 14px 20px;
        font-weight: 600;
        color: #1e293b;

        .col {
          font-weight: 600;
          font-size: 13px;
          color: #64748b;
        }
      }
    }

    .list-body {
      .list-item {
        display: flex;
        padding: 14px 20px;
        border-bottom: 1px solid #e2e8f0;
        transition: background-color 0.2s ease;

        &:hover {
          background: #f8fafc;
        }

        &:last-child {
          border-bottom: none;
        }

        .col {
          display: flex;
          align-items: center;
          padding: 0 10px;
          font-size: 14px;
          color: #1e293b;

          &.col-id {
            width: 80px;
            font-weight: 600;
          }

          &.col-time {
            width: 150px;
          }

          &.col-elderly {
            width: 120px;
          }

          &.col-type {
            width: 120px;
          }

          &.col-level {
            width: 100px;

            .level-badge {
              padding: 4px 12px;
              border-radius: 12px;
              font-size: 12px;
              font-weight: 500;

              &.level-low {
                background: #dcfce7;
                color: #166534;
              }

              &.level-medium {
                background: #fef9c3;
                color: #92400e;
              }

              &.level-high {
                background: #fee2e2;
                color: #991b1b;
              }

              &.level-critical {
                background: #fee2e2;
                color: #991b1b;
                font-weight: 600;
              }
            }
          }

          &.col-content {
            flex: 1;
            min-width: 200px;
          }

          &.col-status {
            width: 120px;

            .status-badge {
              padding: 4px 12px;
              border-radius: 12px;
              font-size: 12px;
              font-weight: 500;

              &.status-pending {
                background: #fef3c7;
                color: #92400e;
              }

              &.status-processing {
                background: #dbeafe;
                color: #1d4ed8;
              }

              &.status-completed {
                background: #dcfce7;
                color: #166534;
              }

              &.status-dismissed {
                background: #f1f5f9;
                color: #64748b;
              }
            }
          }

          &.col-handler {
            width: 120px;
          }

          &.col-actions {
            width: 200px;
            display: flex;
            gap: 8px;

            .btn {
              padding: 6px 12px;
              font-size: 12px;
            }
          }
        }
      }
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      color: #64748b;

      .empty-icon {
        font-size: 48px;
        margin-bottom: 16px;
        color: #94a3b8;
      }

      p {
        margin: 0;
        font-size: 14px;
      }
    }
  }

  .pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 15px;
    margin-top: 28px;

    .page-btn {
      padding: 8px 20px;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      background: white;
      cursor: pointer;
      font-size: 14px;
      color: #1e293b;
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

    .page-info {
      font-size: 14px;
      color: #64748b;
    }
  }

  // 弹窗样式
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .modal-content {
    background: white;
    border-radius: 16px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
    width: 90%;
    max-width: 600px;
    max-height: 90vh;
    overflow-y: auto;

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 24px;
      border-bottom: 1px solid #e2e8f0;

      h3 {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
        color: #1e293b;
      }

      .modal-close {
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        color: #64748b;
        line-height: 1;
        padding: 0;

        &:hover {
          color: #1e293b;
        }
      }
    }

    .modal-body {
      padding: 24px;

      .warning-detail {
        .detail-row {
          display: flex;
          margin-bottom: 16px;

          label {
            width: 120px;
            font-weight: 500;
            color: #1e293b;
            font-size: 14px;
            flex-shrink: 0;
          }

          span {
            flex: 1;
            color: #64748b;
            font-size: 14px;
          }

          &.detail-notes {
            align-items: flex-start;

            .notes-input {
              flex: 1;
              padding: 10px 14px;
              border: 1px solid #e2e8f0;
              border-radius: 10px;
              min-height: 100px;
              font-size: 14px;
              resize: vertical;
              color: #1e293b;

              &:focus {
                outline: none;
                border-color: #3b82f6;
                box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
              }
            }
          }
        }

        .detail-actions {
          display: flex;
          justify-content: flex-end;
          gap: 15px;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #e2e8f0;
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: 1024px) {
  .admin-warning {
    .warning-overview {
      grid-template-columns: repeat(2, 1fr);
    }

    .warning-list {
      .list-item {
        flex-wrap: wrap;

        .col {
          flex: 1 1 calc(50% - 20px);
          margin-bottom: 10px;

          &.col-actions {
            flex: 1 1 100%;
            justify-content: flex-start;
            margin-top: 10px;
            padding-top: 10px;
            border-top: 1px solid #e2e8f0;
          }
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .admin-warning {
    padding: 15px;

    .page-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 15px;

      .header-actions {
        flex-direction: column;
        align-items: stretch;

        .filter-box {
          flex-wrap: wrap;
        }
      }
    }

    .warning-overview {
      grid-template-columns: 1fr;
    }

    .warning-list {
      .list-item {
        .col {
          flex: 1 1 100%;
        }
      }
    }
  }
}
</style>