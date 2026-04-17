<template>
  <div class="admin-service">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <button class="btn btn-secondary back-btn" @click="router.push('/admin/dashboard')">
          <IconSvg name="arrow-left" :size="16" />
          <span>返回</span>
        </button>
        <h1>服务预约管理</h1>
      </div>
      <div class="header-actions">
        <div class="filter-box">
          <select v-model="selectedStatus" class="filter-select">
            <option value="">所有状态</option>
            <option value="pending">待审核</option>
            <option value="approved">已通过</option>
            <option value="rejected">已拒绝</option>
            <option value="completed">已完成</option>
          </select>
          <select v-model="selectedServiceType" class="filter-select">
            <option value="">所有服务</option>
            <option value="nursing">护理服务</option>
            <option value="medical">医疗服务</option>
            <option value="recreation">娱乐活动</option>
            <option value="other">其他服务</option>
          </select>
          <button class="btn btn-secondary" @click="handleFilter">筛选</button>
        </div>
        <button class="btn btn-primary" @click="exportServices">
          <IconSvg name="download" :size="16" />
          <span>导出记录</span>
        </button>
      </div>
    </div>

    <!-- 服务预约概览 -->
    <div class="service-overview">
      <div class="overview-card">
        <div class="card-icon">
          <IconSvg name="calendar" :size="32" />
        </div>
        <div class="card-content">
          <h3>总预约数</h3>
          <p class="card-value">{{ totalServices }}</p>
          <p class="card-desc">全部服务预约</p>
        </div>
      </div>
      <div class="overview-card">
        <div class="card-icon warning">
          <IconSvg name="clock" :size="32" />
        </div>
        <div class="card-content">
          <h3>待审核</h3>
          <p class="card-value">{{ pendingServices }}</p>
          <p class="card-desc">等待审核的预约</p>
        </div>
      </div>
      <div class="overview-card">
        <div class="card-icon success">
          <IconSvg name="check-circle" :size="32" />
        </div>
        <div class="card-content">
          <h3>已通过</h3>
          <p class="card-value">{{ approvedServices }}</p>
          <p class="card-desc">审核通过的预约</p>
        </div>
      </div>
      <div class="overview-card">
        <div class="card-icon danger">
          <IconSvg name="x-circle" :size="32" />
        </div>
        <div class="card-content">
          <h3>已拒绝</h3>
          <p class="card-value">{{ rejectedServices }}</p>
          <p class="card-desc">审核拒绝的预约</p>
        </div>
      </div>
    </div>

    <!-- 服务预约列表 -->
    <div class="service-list">
      <div class="list-header">
        <div class="list-item">
          <div class="col col-id">ID</div>
          <div class="col col-time">预约时间</div>
          <div class="col col-elderly">老人</div>
          <div class="col col-family">家属</div>
          <div class="col col-service">服务类型</div>
          <div class="col col-date">服务日期</div>
          <div class="col col-status">状态</div>
          <div class="col col-actions">操作</div>
        </div>
      </div>
      <div class="list-body">
        <div 
          v-for="service in filteredServices" 
          :key="service.id"
          class="list-item"
        >
          <div class="col col-id">{{ service.id }}</div>
          <div class="col col-time">{{ service.reserveTime }}</div>
          <div class="col col-elderly">{{ service.elderlyName }}</div>
          <div class="col col-family">{{ service.familyName }}</div>
          <div class="col col-service">{{ service.serviceType }}</div>
          <div class="col col-date">{{ service.serviceDate }}</div>
          <div class="col col-status">
            <span 
              class="status-badge"
              :class="{
                'status-pending': service.status === 'pending',
                'status-approved': service.status === 'approved',
                'status-rejected': service.status === 'rejected',
                'status-completed': service.status === 'completed'
              }"
            >
              {{ service.status === 'pending' ? '待审核' : service.status === 'approved' ? '已通过' : service.status === 'rejected' ? '已拒绝' : '已完成' }}
            </span>
          </div>
          <div class="col col-actions">
            <button class="btn btn-sm btn-info" @click="viewServiceDetail(service.id)">详情</button>
            <button 
              v-if="service.status === 'pending'"
              class="btn btn-sm btn-success" 
              @click="approveService(service.id)"
            >
              通过
            </button>
            <button 
              v-if="service.status === 'pending'"
              class="btn btn-sm btn-danger" 
              @click="rejectService(service.id)"
            >
              拒绝
            </button>
            <button 
              v-if="service.status === 'approved'"
              class="btn btn-sm btn-primary" 
              @click="completeService(service.id)"
            >
              完成
            </button>
          </div>
        </div>
      </div>
      <!-- 空状态 -->
      <div v-if="filteredServices.length === 0" class="empty-state">
        <div class="empty-icon">
          <IconSvg name="calendar" :size="48" />
        </div>
        <p>暂无服务预约</p>
      </div>
    </div>

    <!-- 分页 -->
    <div class="pagination" v-if="filteredServices.length > 0">
      <button class="page-btn" @click="prevPage" :disabled="currentPage === 1">上一页</button>
      <span class="page-info">第 {{ currentPage }} 页，共 {{ totalPages }} 页</span>
      <button class="page-btn" @click="nextPage" :disabled="currentPage === totalPages">下一页</button>
    </div>

    <!-- 服务详情弹窗 -->
    <div v-if="showDetailModal" class="modal-overlay" @click="closeDetailModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>服务预约详情</h3>
          <button class="modal-close" @click="closeDetailModal">×</button>
        </div>
        <div class="modal-body">
          <div v-if="selectedService" class="service-detail">
            <div class="detail-row">
              <label>预约ID:</label>
              <span>{{ selectedService.id }}</span>
            </div>
            <div class="detail-row">
              <label>预约时间:</label>
              <span>{{ selectedService.reserveTime }}</span>
            </div>
            <div class="detail-row">
              <label>老人姓名:</label>
              <span>{{ selectedService.elderlyName }}</span>
            </div>
            <div class="detail-row">
              <label>家属姓名:</label>
              <span>{{ selectedService.familyName }}</span>
            </div>
            <div class="detail-row">
              <label>联系电话:</label>
              <span>{{ selectedService.phone }}</span>
            </div>
            <div class="detail-row">
              <label>服务类型:</label>
              <span>{{ selectedService.serviceType }}</span>
            </div>
            <div class="detail-row">
              <label>服务日期:</label>
              <span>{{ selectedService.serviceDate }}</span>
            </div>
            <div class="detail-row">
              <label>服务时间:</label>
              <span>{{ selectedService.serviceTime }}</span>
            </div>
            <div class="detail-row">
              <label>服务内容:</label>
              <span>{{ selectedService.serviceContent }}</span>
            </div>
            <div class="detail-row">
              <label>特殊需求:</label>
              <span>{{ selectedService.specialNeeds || '无' }}</span>
            </div>
            <div class="detail-row">
              <label>当前状态:</label>
              <span>
                <span 
                  class="status-badge"
                  :class="{
                    'status-pending': selectedService.status === 'pending',
                    'status-approved': selectedService.status === 'approved',
                    'status-rejected': selectedService.status === 'rejected',
                    'status-completed': selectedService.status === 'completed'
                  }"
                >
                  {{ selectedService.status === 'pending' ? '待审核' : selectedService.status === 'approved' ? '已通过' : selectedService.status === 'rejected' ? '已拒绝' : '已完成' }}
                </span>
              </span>
            </div>
            <div class="detail-row detail-notes">
              <label>审核备注:</label>
              <textarea 
                v-model="selectedService.notes"
                class="notes-input"
                placeholder="请输入审核备注"
              ></textarea>
            </div>
            <div class="detail-actions">
              <button class="btn btn-secondary" @click="closeDetailModal">关闭</button>
              <button class="btn btn-primary" @click="saveServiceDetail">保存备注</button>
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
const serviceList = ref([]);
const selectedStatus = ref('');
const selectedServiceType = ref('');
const currentPage = ref(1);
const pageSize = ref(10);
const showDetailModal = ref(false);
const selectedService = ref(null);

// 计算属性：过滤后的服务列表
const filteredServices = computed(() => {
  let filtered = serviceList.value;
  if (selectedStatus.value) {
    filtered = filtered.filter(s => s.status === selectedStatus.value);
  }
  if (selectedServiceType.value) {
    filtered = filtered.filter(s => s.serviceType === selectedServiceType.value);
  }
  // 分页处理
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filtered.slice(start, end);
});

// 计算属性：总页数
const totalPages = computed(() => {
  let filtered = serviceList.value;
  if (selectedStatus.value) {
    filtered = filtered.filter(s => s.status === selectedStatus.value);
  }
  if (selectedServiceType.value) {
    filtered = filtered.filter(s => s.serviceType === selectedServiceType.value);
  }
  return Math.ceil(filtered.length / pageSize.value);
});

// 计算属性：总预约数
const totalServices = computed(() => serviceList.value.length);

// 计算属性：待审核预约数
const pendingServices = computed(() => serviceList.value.filter(s => s.status === 'pending').length);

// 计算属性：已通过预约数
const approvedServices = computed(() => serviceList.value.filter(s => s.status === 'approved').length);

// 计算属性：已拒绝预约数
const rejectedServices = computed(() => serviceList.value.filter(s => s.status === 'rejected').length);

// 生命周期：组件挂载时获取服务预约数据
onMounted(() => {
  fetchServices();
});

// 方法：获取服务预约数据
const fetchServices = () => {
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
    const baseServices = [
      { id: 1, reserveTime: '2024-01-20 09:00', elderlyId: 1, familyName: '张小明', phone: '13800138001', serviceType: '护理服务', serviceDate: '2024-01-21', serviceTime: '09:00-11:00', serviceContent: '日常护理', specialNeeds: '需要搀扶', status: 'pending', notes: '' },
      { id: 2, reserveTime: '2024-01-20 10:30', elderlyId: 2, familyName: '李小华', phone: '13800138002', serviceType: '医疗服务', serviceDate: '2024-01-21', serviceTime: '14:00-16:00', serviceContent: '健康检查', specialNeeds: '需要轮椅', status: 'approved', notes: '已安排医护人员' },
      { id: 3, reserveTime: '2024-01-20 11:15', elderlyId: 3, familyName: '王大力', phone: '13800138003', serviceType: '娱乐活动', serviceDate: '2024-01-22', serviceTime: '10:00-12:00', serviceContent: '棋牌活动', specialNeeds: '无', status: 'completed', notes: '活动已顺利完成' },
      { id: 4, reserveTime: '2024-01-20 14:00', elderlyId: 4, familyName: '赵小红', phone: '13800138004', serviceType: '护理服务', serviceDate: '2024-01-22', serviceTime: '15:00-17:00', serviceContent: '康复护理', specialNeeds: '需要专业护理', status: 'rejected', notes: '暂时无法安排专业护理人员' },
      { id: 5, reserveTime: '2024-01-20 15:30', elderlyId: 5, familyName: '钱小刚', phone: '13800138005', serviceType: '其他服务', serviceDate: '2024-01-23', serviceTime: '09:00-10:00', serviceContent: '上门理发', specialNeeds: '无', status: 'pending', notes: '' },
      { id: 6, reserveTime: '2024-01-20 16:45', elderlyId: 1, familyName: '张小明', phone: '13800138001', serviceType: '医疗服务', serviceDate: '2024-01-23', serviceTime: '14:00-15:30', serviceContent: '用药指导', specialNeeds: '需要详细讲解', status: 'pending', notes: '' },
      { id: 7, reserveTime: '2024-01-20 17:20', elderlyId: 2, familyName: '李小华', phone: '13800138002', serviceType: '娱乐活动', serviceDate: '2024-01-24', serviceTime: '10:00-11:30', serviceContent: '唱歌活动', specialNeeds: '喜欢老歌', status: 'approved', notes: '已准备歌曲列表' },
      { id: 8, reserveTime: '2024-01-20 18:00', elderlyId: 3, familyName: '王大力', phone: '13800138003', serviceType: '护理服务', serviceDate: '2024-01-24', serviceTime: '15:00-16:30', serviceContent: ' bath护理', specialNeeds: '需要温水', status: 'pending', notes: '' },
      { id: 9, reserveTime: '2024-01-20 19:15', elderlyId: 4, familyName: '赵小红', phone: '13800138004', serviceType: '医疗服务', serviceDate: '2024-01-25', serviceTime: '09:00-10:30', serviceContent: '血压监测', specialNeeds: '无', status: 'pending', notes: '' },
      { id: 10, reserveTime: '2024-01-20 20:30', elderlyId: 5, familyName: '钱小刚', phone: '13800138005', serviceType: '其他服务', serviceDate: '2024-01-25', serviceTime: '14:00-15:00', serviceContent: '代购服务', specialNeeds: '需要新鲜蔬菜', status: 'pending', notes: '' }
    ];
    
    // 根据老人列表更新服务预约数据中的老人名称
    serviceList.value = baseServices.map(service => ({
      ...service,
      elderlyName: elderlyMap[service.elderlyId] || service.elderlyName
    }));
  }, 300);
};

// 方法：筛选服务预约
const handleFilter = () => {
  currentPage.value = 1;
  // 重新获取最新的服务预约数据
  fetchServices();
};

// 方法：导出服务预约记录
const exportServices = () => {
  alert('服务预约记录导出功能已触发');
};

// 方法：查看服务预约详情
const viewServiceDetail = (id) => {
  const service = serviceList.value.find(s => s.id === id);
  if (service) {
    selectedService.value = { ...service };
    showDetailModal.value = true;
  }
};

// 方法：关闭详情弹窗
const closeDetailModal = () => {
  showDetailModal.value = false;
  selectedService.value = null;
};

// 方法：保存服务预约详情
const saveServiceDetail = () => {
  if (selectedService.value) {
    const index = serviceList.value.findIndex(s => s.id === selectedService.value.id);
    if (index !== -1) {
      serviceList.value[index] = { ...selectedService.value };
    }
    closeDetailModal();
  }
};

// 方法：通过服务预约
const approveService = (id) => {
  const index = serviceList.value.findIndex(s => s.id === id);
  if (index !== -1) {
    serviceList.value[index].status = 'approved';
    serviceList.value[index].notes = '审核通过';
  }
};

// 方法：拒绝服务预约
const rejectService = (id) => {
  const index = serviceList.value.findIndex(s => s.id === id);
  if (index !== -1) {
    serviceList.value[index].status = 'rejected';
    serviceList.value[index].notes = '审核拒绝';
  }
};

// 方法：完成服务预约
const completeService = (id) => {
  const index = serviceList.value.findIndex(s => s.id === id);
  if (index !== -1) {
    serviceList.value[index].status = 'completed';
    serviceList.value[index].notes = '服务已完成';
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
.admin-service {
  padding: 20px;
  background: #f8fafc;
  min-height: 100vh;

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
    padding-bottom: 15px;
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
          font-size: 14px;
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
          border-radius: 12px;
          font-size: 13px;
          min-width: 120px;

          &:focus {
            outline: none;
            border-color: #2563eb;
            box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
          }
        }
      }
    }
  }

  .service-overview {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
    margin-bottom: 30px;

    .overview-card {
      background: white;
      border-radius: 16px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
      padding: 20px;
      display: flex;
      align-items: center;
      gap: 15px;
      transition: transform 0.25s ease, box-shadow 0.25s ease;

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1);
      }

      .card-icon {
        font-size: 40px;
        width: 60px;
        height: 60px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #f8fafc;
        border-radius: 50%;
      }

      .card-content {
        flex: 1;

        h3 {
          font-size: 13px;
          font-weight: 500;
          color: #64748b;
          margin: 0 0 8px 0;
        }

        .card-value {
          font-size: 20px;
          font-weight: 700;
          color: #1e293b;
          margin: 0 0 4px 0;
        }

        .card-desc {
          font-size: 12px;
          color: #64748b;
          margin: 0;
        }
      }
    }
  }

  .service-list {
    background: white;
    border-radius: 16px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
    overflow: hidden;

    .list-header {
      background: #f8fafc;
      border-bottom: 1px solid #e2e8f0;

      .list-item {
        display: flex;
        padding: 15px 20px;
        font-weight: 600;
        color: #1e293b;

        .col {
          font-weight: 600;
        }
      }
    }

    .list-body {
      .list-item {
        display: flex;
        padding: 15px 20px;
        border-bottom: 1px solid #e2e8f0;
        transition: background-color 0.25s ease;

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

          &.col-family {
            width: 120px;
          }

          &.col-service {
            width: 120px;
          }

          &.col-date {
            width: 120px;
          }

          &.col-status {
            width: 120px;

            .status-badge {
              padding: 5px 14px;
              border-radius: 20px;
              font-size: 12px;
              font-weight: 500;

              &.status-pending {
                background: rgba(217, 119, 6, 0.1);
                color: #d97706;
              }

              &.status-approved {
                background: rgba(22, 163, 74, 0.1);
                color: #16a34a;
              }

              &.status-rejected {
                background: rgba(220, 38, 38, 0.1);
                color: #dc2626;
              }

              &.status-completed {
                background: rgba(37, 99, 235, 0.1);
                color: #2563eb;
              }
            }
          }

          &.col-actions {
            width: 180px;
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
      }

      p {
        margin: 0;
        font-size: 13px;
      }
    }
  }

  .pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 15px;
    margin-top: 30px;

    .page-btn {
      padding: 8px 16px;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      background: white;
      cursor: pointer;
      font-size: 13px;

      &:hover:not(:disabled) {
        border-color: #2563eb;
        color: #2563eb;
      }

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }

    .page-info {
      font-size: 13px;
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
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.15);
    width: 90%;
    max-width: 600px;
    max-height: 90vh;
    overflow-y: auto;

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px;
      border-bottom: 1px solid #e2e8f0;

      h3 {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
        color: #1e293b;
      }

      .modal-close {
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        color: #64748b;

        &:hover {
          color: #1e293b;
        }
      }
    }

    .modal-body {
      padding: 20px;

      .service-detail {
        .detail-row {
          display: flex;
          margin-bottom: 15px;

          label {
            width: 120px;
            font-weight: 500;
            color: #1e293b;
          }

          span {
            flex: 1;
            color: #64748b;
          }

          &.detail-notes {
            align-items: flex-start;

            .notes-input {
              flex: 1;
              padding: 10px;
              border: 1px solid #e2e8f0;
              border-radius: 12px;
              min-height: 100px;
              font-size: 13px;
              resize: vertical;

              &:focus {
                outline: none;
                border-color: #2563eb;
                box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
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
  .admin-service {
    .service-overview {
      grid-template-columns: repeat(2, 1fr);
    }

    .service-list {
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
  .admin-service {
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

    .service-overview {
      grid-template-columns: 1fr;
    }

    .service-list {
      .list-item {
        .col {
          flex: 1 1 100%;
        }
      }
    }
  }
}
</style>