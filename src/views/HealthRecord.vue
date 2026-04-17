<template>
  <div>
    <AppHeader title="健康档案管理" />
    <FamilyNav />
    <div class="container">
      <div class="card filter-card">
        <div class="filter-item">
          <label>老人ID：</label>
          <input type="text" v-model="elderlyId" readonly class="form-control" />
        </div>
      </div>

      <div class="tab-container">
        <div class="tab-header">
          <button 
            v-for="tab in tabs" 
            :key="tab.key"
            :class="['tab-btn', { active: activeTab === tab.key }]"
            @click="switchTab(tab.key)"
          >
            {{ tab.label }}
          </button>
        </div>

        <div class="tab-content">
          <!-- 基本健康信息 -->
          <div v-if="activeTab === 'basicInfo'" class="tab-pane">
            <div class="card info-card">
              <h3>基本健康信息</h3>
              <div class="loading-overlay" v-if="isLoading">
                <div class="loading-spinner"></div>
                <div class="loading-text">加载中...</div>
              </div>
              <div class="info-form" v-else>
                <div class="form-row">
                  <div class="form-group">
                    <label>姓名</label>
                    <input type="text" v-model="basicInfo.name" class="form-control" />
                  </div>
                  <div class="form-group">
                    <label>性别</label>
                    <select v-model="basicInfo.gender" class="form-control">
                      <option value="男">男</option>
                      <option value="女">女</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label>年龄</label>
                    <input type="number" v-model="basicInfo.age" class="form-control" />
                  </div>
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label>身高 (cm)</label>
                    <input type="number" v-model="basicInfo.height" class="form-control" />
                  </div>
                  <div class="form-group">
                    <label>体重 (kg)</label>
                    <input type="number" v-model="basicInfo.weight" class="form-control" />
                  </div>
                  <div class="form-group">
                    <label>血型</label>
                    <select v-model="basicInfo.bloodType" class="form-control">
                      <option value="A">A型</option>
                      <option value="B">B型</option>
                      <option value="O">O型</option>
                      <option value="AB">AB型</option>
                    </select>
                  </div>
                </div>
                <div class="form-row">
                  <div class="form-group full-width">
                    <label>过敏史</label>
                    <textarea v-model="basicInfo.allergies" class="form-control" rows="2"></textarea>
                  </div>
                </div>
                <div class="form-row">
                  <div class="form-group full-width">
                    <label>既往病史</label>
                    <textarea v-model="basicInfo.medicalHistory" class="form-control" rows="3"></textarea>
                  </div>
                </div>
                <div class="form-row">
                  <div class="form-group full-width">
                    <label>家族病史</label>
                    <textarea v-model="basicInfo.familyHistory" class="form-control" rows="2"></textarea>
                  </div>
                </div>
                <div class="form-actions">
                  <button class="btn btn-primary" @click="saveBasicInfo">保存信息</button>
                </div>
              </div>
            </div>
          </div>

          <!-- 用药管理 -->
          <div v-if="activeTab === 'medication'" class="tab-pane">
            <div class="card medication-card">
              <div class="card-header">
                <h3>用药管理</h3>
                <button class="btn btn-primary btn-sm" @click="openAddMedicationModal">添加药品</button>
              </div>
              <div class="loading-overlay" v-if="isLoading">
                <div class="loading-spinner"></div>
                <div class="loading-text">加载中...</div>
              </div>
              <div class="medication-list" v-else>
                <div class="medication-item" v-for="(med, index) in medications" :key="med.id || index">
                  <div class="med-info">
                    <h4>{{ med.name }}</h4>
                    <div class="med-details">
                      <span class="detail-item"><strong>用法用量：</strong>{{ med.dosage }}</span>
                      <span class="detail-item"><strong>服药时间：</strong>{{ med.times }}</span>
                      <span class="detail-item"><strong>开始日期：</strong>{{ med.startDate }}</span>
                      <span class="detail-item" v-if="med.endDate"><strong>结束日期：</strong>{{ med.endDate }}</span>
                      <span class="detail-item"><strong>状态：</strong>{{ med.status }}</span>
                    </div>
                    <div class="med-note" v-if="med.note">
                      <strong>备注：</strong>{{ med.note }}
                    </div>
                  </div>
                  <div class="med-actions">
                    <button class="btn btn-outline btn-sm" @click="editMedication(med)">
                      编辑
                    </button>
                    <button class="btn btn-danger btn-sm" @click="deleteMedication(med.id || index)">
                      删除
                    </button>
                  </div>
                </div>
                <div class="empty-state" v-if="medications.length === 0">
                  <div class="empty-icon">
                    <IconSvg name="pill" :size="48" />
                  </div>
                  <div class="empty-text">暂无用药记录</div>
                </div>
              </div>
            </div>
          </div>

          <!-- 就诊记录 -->
          <div v-if="activeTab === 'medicalRecord'" class="tab-pane">
            <div class="card record-card">
              <div class="card-header">
                <h3>就诊记录</h3>
                <button class="btn btn-primary btn-sm" @click="openAddRecordModal">添加记录</button>
              </div>
              <div class="loading-overlay" v-if="isLoading">
                <div class="loading-spinner"></div>
                <div class="loading-text">加载中...</div>
              </div>
              <div class="record-list" v-else>
                <div class="record-item" v-for="(record, index) in medicalRecords" :key="record.id || index">
                  <div class="record-header">
                    <h4>{{ record.hospital }} - {{ record.department }}</h4>
                    <div class="record-date">{{ record.date }}</div>
                  </div>
                  <div class="record-details">
                    <div class="detail-item"><strong>诊断结果：</strong>{{ record.diagnosis }}</div>
                    <div class="detail-item"><strong>主治医生：</strong>{{ record.doctor }}</div>
                    <div class="detail-item" v-if="record.prescription"><strong>处方：</strong>{{ record.prescription }}</div>
                    <div class="detail-item" v-if="record.advice"><strong>医嘱：</strong>{{ record.advice }}</div>
                    <div class="detail-item" v-if="record.cost"><strong>费用：</strong>{{ record.cost }}元</div>
                  </div>
                  <div class="record-actions">
                    <button class="btn btn-outline btn-sm" @click="editMedicalRecord(record)">
                      编辑
                    </button>
                    <button class="btn btn-danger btn-sm" @click="deleteMedicalRecord(record.id || index)">
                      删除
                    </button>
                  </div>
                </div>
                <div class="empty-state" v-if="medicalRecords.length === 0">
                  <div class="empty-icon">
                    <IconSvg name="hospital" :size="48" />
                  </div>
                  <div class="empty-text">暂无就诊记录</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 添加/编辑药品弹窗 -->
    <div class="modal" v-if="showAddMedicationModal || showEditMedicationModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>{{ showEditMedicationModal ? '编辑药品' : '添加药品' }}</h3>
          <button class="btn btn-close" @click="closeMedicationModal">×</button>
        </div>
        <div class="modal-body">
          <div class="form-row">
            <div class="form-group">
              <label>药品名称</label>
              <input type="text" v-model="currentMedication.name" class="form-control" required />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>用法用量</label>
              <input type="text" v-model="currentMedication.dosage" class="form-control" required />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>服药时间</label>
              <input type="text" v-model="currentMedication.times" class="form-control" placeholder="例如：早8点、晚8点" required />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>开始日期</label>
              <input type="date" v-model="currentMedication.startDate" class="form-control" required />
            </div>
            <div class="form-group">
              <label>结束日期 (可选)</label>
              <input type="date" v-model="currentMedication.endDate" class="form-control" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>状态</label>
              <select v-model="currentMedication.status" class="form-control">
                <option value="服用中">服用中</option>
                <option value="已停用">已停用</option>
              </select>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group full-width">
              <label>备注 (可选)</label>
              <textarea v-model="currentMedication.note" class="form-control" rows="2"></textarea>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline" @click="closeMedicationModal">取消</button>
          <button class="btn btn-primary" @click="saveMedication">保存</button>
        </div>
      </div>
    </div>

    <!-- 添加/编辑就诊记录弹窗 -->
    <div class="modal" v-if="showAddRecordModal || showEditRecordModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>{{ showEditRecordModal ? '编辑就诊记录' : '添加就诊记录' }}</h3>
          <button class="btn btn-close" @click="closeRecordModal">×</button>
        </div>
        <div class="modal-body">
          <div class="form-row">
            <div class="form-group">
              <label>医院名称</label>
              <input type="text" v-model="currentRecord.hospital" class="form-control" required />
            </div>
            <div class="form-group">
              <label>科室</label>
              <input type="text" v-model="currentRecord.department" class="form-control" required />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>就诊日期</label>
              <input type="date" v-model="currentRecord.date" class="form-control" required />
            </div>
            <div class="form-group">
              <label>主治医生</label>
              <input type="text" v-model="currentRecord.doctor" class="form-control" required />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group full-width">
              <label>诊断结果</label>
              <textarea v-model="currentRecord.diagnosis" class="form-control" rows="2" required></textarea>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group full-width">
              <label>处方 (可选)</label>
              <textarea v-model="currentRecord.prescription" class="form-control" rows="3"></textarea>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group full-width">
              <label>医嘱 (可选)</label>
              <textarea v-model="currentRecord.advice" class="form-control" rows="2"></textarea>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>费用 (元) (可选)</label>
              <input type="number" v-model="currentRecord.cost" class="form-control" step="0.01" />
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline" @click="closeRecordModal">取消</button>
          <button class="btn btn-primary" @click="saveMedicalRecord">保存</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import AppHeader from '../components/AppHeader.vue';
import FamilyNav from '../components/FamilyNav.vue';
import IconSvg from '../components/IconSvg.vue';

const elderlyId = ref(localStorage.getItem('current_elderly_id') || '1001');
const activeTab = ref('basicInfo');
const isLoading = ref(false);

// 标签页配置
const tabs = [
  { key: 'basicInfo', label: '基本健康信息' },
  { key: 'medication', label: '用药管理' },
  { key: 'medicalRecord', label: '就诊记录' }
];

// 基本健康信息
const basicInfo = ref({
  name: '',
  gender: '男',
  age: '',
  height: '',
  weight: '',
  bloodType: 'A',
  allergies: '',
  medicalHistory: '',
  familyHistory: ''
});

// 用药管理
const medications = ref([]);
const showAddMedicationModal = ref(false);
const showEditMedicationModal = ref(false);
const currentMedication = ref({
  name: '',
  dosage: '',
  times: '',
  startDate: '',
  endDate: '',
  status: '服用中',
  note: ''
});

// 就诊记录
const medicalRecords = ref([]);
const showAddRecordModal = ref(false);
const showEditRecordModal = ref(false);
const currentRecord = ref({
  hospital: '',
  department: '',
  date: '',
  doctor: '',
  diagnosis: '',
  prescription: '',
  advice: '',
  cost: ''
});

// 切换标签页
const switchTab = (tabKey) => {
  activeTab.value = tabKey;
  // 加载对应标签页的数据
  if (tabKey === 'medication' && medications.value.length === 0) {
    fetchMedications();
  }
  if (tabKey === 'medicalRecord' && medicalRecords.value.length === 0) {
    fetchMedicalRecords();
  }
};

// 加载基本健康信息
const fetchBasicInfo = async () => {
  try {
    isLoading.value = true;
    // 实际项目中应调用API
    // const data = await getBasicHealthInfo(elderlyId.value);
    // basicInfo.value = data || {};
    
    // 模拟数据
    basicInfo.value = {
      name: '张三',
      gender: '男',
      age: '75',
      height: '170',
      weight: '65',
      bloodType: 'A型',
      allergies: '青霉素',
      medicalHistory: '高血压、糖尿病',
      familyHistory: '父亲有高血压史'
    };
  } catch (error) {
    console.error('获取基本健康信息失败：', error);
  } finally {
    isLoading.value = false;
  }
};

// 保存基本健康信息
const saveBasicInfo = async () => {
  try {
    isLoading.value = true;
    // 实际项目中应调用API
    // await saveBasicHealthInfo(elderlyId.value, basicInfo.value);
    
    // 模拟保存
    setTimeout(() => {
      alert('基本健康信息保存成功！');
    }, 500);
  } catch (error) {
    console.error('保存基本健康信息失败：', error);
    alert('保存失败，请稍后重试');
  } finally {
    isLoading.value = false;
  }
};

// 加载用药记录
const fetchMedications = async () => {
  try {
    isLoading.value = true;
    // 实际项目中应调用API
    // const data = await getMedications(elderlyId.value);
    // medications.value = data || [];
    
    // 模拟数据
    medications.value = [
      {
        id: 'med_1',
        name: '硝苯地平缓释片',
        dosage: '每日1次，每次1片',
        times: '早8点',
        startDate: '2026-01-01',
        endDate: '',
        status: '服用中',
        note: '饭后服用'
      },
      {
        id: 'med_2',
        name: '二甲双胍片',
        dosage: '每日3次，每次1片',
        times: '早中晚各一次',
        startDate: '2026-01-01',
        endDate: '',
        status: '服用中',
        note: '饭前30分钟服用'
      }
    ];
  } catch (error) {
    console.error('获取用药记录失败：', error);
  } finally {
    isLoading.value = false;
  }
};

// 打开添加药品弹窗
const openAddMedicationModal = () => {
  currentMedication.value = {
    name: '',
    dosage: '',
    times: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    status: '服用中',
    note: ''
  };
  showAddMedicationModal.value = true;
  showEditMedicationModal.value = false;
};

// 打开编辑药品弹窗
const editMedication = (med) => {
  currentMedication.value = { ...med };
  showEditMedicationModal.value = true;
  showAddMedicationModal.value = false;
};

// 关闭药品弹窗
const closeMedicationModal = () => {
  showAddMedicationModal.value = false;
  showEditMedicationModal.value = false;
  currentMedication.value = {
    name: '',
    dosage: '',
    times: '',
    startDate: '',
    endDate: '',
    status: '服用中',
    note: ''
  };
};

// 保存药品信息
const saveMedication = async () => {
  try {
    if (!currentMedication.value.name || !currentMedication.value.dosage || !currentMedication.value.times || !currentMedication.value.startDate) {
      alert('请填写必填项');
      return;
    }
    
    isLoading.value = true;
    // 实际项目中应调用API
    // if (showEditMedicationModal.value) {
    //   await updateMedication(elderlyId.value, currentMedication.value.id, currentMedication.value);
    // } else {
    //   await addMedication(elderlyId.value, currentMedication.value);
    // }
    
    // 模拟保存
    setTimeout(() => {
      if (showEditMedicationModal.value) {
        const index = medications.value.findIndex(m => m.id === currentMedication.value.id);
        if (index !== -1) {
          medications.value[index] = { ...currentMedication.value };
        }
      } else {
        medications.value.push({
          ...currentMedication.value,
          id: `med_${Date.now()}`
        });
      }
      closeMedicationModal();
      alert('药品信息保存成功！');
    }, 500);
  } catch (error) {
    console.error('保存药品信息失败：', error);
    alert('保存失败，请稍后重试');
  } finally {
    isLoading.value = false;
  }
};

// 删除药品
const deleteMedication = async (id) => {
  try {
    if (confirm('确定要删除这个药品记录吗？')) {
      isLoading.value = true;
      // 实际项目中应调用API
      // await deleteMedication(elderlyId.value, id);
      
      // 模拟删除
      setTimeout(() => {
        medications.value = medications.value.filter(m => (m.id || medications.value.indexOf(m)) !== id);
        alert('药品记录删除成功！');
      }, 500);
    }
  } catch (error) {
    console.error('删除药品记录失败：', error);
    alert('删除失败，请稍后重试');
  } finally {
    isLoading.value = false;
  }
};

// 加载就诊记录
const fetchMedicalRecords = async () => {
  try {
    isLoading.value = true;
    // 实际项目中应调用API
    // const data = await getMedicalRecords(elderlyId.value);
    // medicalRecords.value = data || [];
    
    // 模拟数据
    medicalRecords.value = [
      {
        id: 'record_1',
        hospital: '市第一人民医院',
        department: '心内科',
        date: '2026-01-15',
        doctor: '王医生',
        diagnosis: '高血压 II 期',
        prescription: '硝苯地平缓释片 每日1次，每次1片',
        advice: '低盐低脂饮食，适量运动，定期监测血压',
        cost: '268.5'
      },
      {
        id: 'record_2',
        hospital: '市第一人民医院',
        department: '内分泌科',
        date: '2026-01-10',
        doctor: '李医生',
        diagnosis: '2型糖尿病',
        prescription: '二甲双胍片 每日3次，每次1片',
        advice: '控制饮食，规律作息，定期监测血糖',
        cost: '185.0'
      }
    ];
  } catch (error) {
    console.error('获取就诊记录失败：', error);
  } finally {
    isLoading.value = false;
  }
};

// 打开添加就诊记录弹窗
const openAddRecordModal = () => {
  currentRecord.value = {
    hospital: '',
    department: '',
    date: new Date().toISOString().split('T')[0],
    doctor: '',
    diagnosis: '',
    prescription: '',
    advice: '',
    cost: ''
  };
  showAddRecordModal.value = true;
  showEditRecordModal.value = false;
};

// 打开编辑就诊记录弹窗
const editMedicalRecord = (record) => {
  currentRecord.value = { ...record };
  showEditRecordModal.value = true;
  showAddRecordModal.value = false;
};

// 关闭就诊记录弹窗
const closeRecordModal = () => {
  showAddRecordModal.value = false;
  showEditRecordModal.value = false;
  currentRecord.value = {
    hospital: '',
    department: '',
    date: '',
    doctor: '',
    diagnosis: '',
    prescription: '',
    advice: '',
    cost: ''
  };
};

// 保存就诊记录
const saveMedicalRecord = async () => {
  try {
    if (!currentRecord.value.hospital || !currentRecord.value.department || !currentRecord.value.date || !currentRecord.value.doctor || !currentRecord.value.diagnosis) {
      alert('请填写必填项');
      return;
    }
    
    isLoading.value = true;
    // 实际项目中应调用API
    // if (showEditRecordModal.value) {
    //   await updateMedicalRecord(elderlyId.value, currentRecord.value.id, currentRecord.value);
    // } else {
    //   await addMedicalRecord(elderlyId.value, currentRecord.value);
    // }
    
    // 模拟保存
    setTimeout(() => {
      if (showEditRecordModal.value) {
        const index = medicalRecords.value.findIndex(r => r.id === currentRecord.value.id);
        if (index !== -1) {
          medicalRecords.value[index] = { ...currentRecord.value };
        }
      } else {
        medicalRecords.value.push({
          ...currentRecord.value,
          id: `record_${Date.now()}`
        });
      }
      closeRecordModal();
      alert('就诊记录保存成功！');
    }, 500);
  } catch (error) {
    console.error('保存就诊记录失败：', error);
    alert('保存失败，请稍后重试');
  } finally {
    isLoading.value = false;
  }
};

// 删除就诊记录
const deleteMedicalRecord = async (id) => {
  try {
    if (confirm('确定要删除这个就诊记录吗？')) {
      isLoading.value = true;
      // 实际项目中应调用API
      // await deleteMedicalRecord(elderlyId.value, id);
      
      // 模拟删除
      setTimeout(() => {
        medicalRecords.value = medicalRecords.value.filter(r => (r.id || medicalRecords.value.indexOf(r)) !== id);
        alert('就诊记录删除成功！');
      }, 500);
    }
  } catch (error) {
    console.error('删除就诊记录失败：', error);
    alert('删除失败，请稍后重试');
  } finally {
    isLoading.value = false;
  }
};

// 页面加载初始化
onMounted(() => {
  fetchBasicInfo();
});
</script>

<style scoped lang="scss">
.filter-card {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: center;
  margin-bottom: 24px;
  padding: 20px;

  .filter-item {
    display: flex;
    align-items: center;
    gap: 8px;

    label {
      font-weight: 500;
      color: #1e293b;
      white-space: nowrap;
    }

    .form-control {
      padding: 8px 12px;
      border-radius: 12px;
      border: 1px solid #e2e8f0;
      min-width: 160px;
      font-size: 14px;

      &:focus {
        outline: none;
        border-color: #2563eb;
        box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.1);
      }

      &[readonly] {
        background-color: #f8fafc;
        cursor: not-allowed;
      }
    }
  }
}

.tab-container {
  margin-bottom: 24px;

  .tab-header {
    display: flex;
    border-bottom: 1px solid #e2e8f0;
    margin-bottom: 20px;

    .tab-btn {
      padding: 12px 24px;
      border: none;
      background: none;
      font-size: 14px;
      font-weight: 500;
      color: #64748b;
      cursor: pointer;
      transition: all 0.25s ease;
      border-bottom: 3px solid transparent;

      &:hover {
        color: #2563eb;
      }

      &.active {
        color: #2563eb;
        border-bottom-color: #2563eb;
      }
    }
  }

  .tab-content {
    .tab-pane {
      min-height: 400px;
    }
  }
}

.info-card,
.medication-card,
.record-card {
  margin-bottom: 24px;

  h3 {
    margin: 0 0 20px 0;
    font-size: 16px;
    font-weight: 600;
    color: #1e293b;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    h3 {
      margin: 0;
    }
  }

  .loading-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.8);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    z-index: 10;
    border-radius: 12px;

    .loading-spinner {
      width: 40px;
      height: 40px;
      border: 3px solid rgba(37, 99, 235, 0.2);
      border-top: 3px solid #2563eb;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 12px;
    }

    .loading-text {
      color: #1e293b;
      font-size: 14px;
    }
  }
}

.info-form {
  .form-row {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    margin-bottom: 16px;

    .form-group {
      flex: 1;
      min-width: 200px;

      &.full-width {
        flex: 100%;
      }

      label {
        display: block;
        margin-bottom: 8px;
        font-weight: 500;
        color: #1e293b;
      }

      .form-control {
        width: 100%;
        padding: 8px 12px;
        border-radius: 12px;
        border: 1px solid #e2e8f0;
        font-size: 14px;

        &:focus {
          outline: none;
          border-color: #2563eb;
          box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.1);
        }

        &[type="date"] {
          padding: 6px 12px;
        }
      }

      textarea {
        resize: vertical;
        min-height: 80px;
      }
    }
  }

  .form-actions {
    margin-top: 24px;
    text-align: right;
  }
}

.medication-list {
  .medication-item {
    background: #f9fafb;
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 16px;
    border-left: 4px solid #0284c7;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    transition: all 0.25s ease;

    &:hover {
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      transform: translateY(-2px);
    }

    .med-info {
      flex: 1;

      h4 {
        margin: 0 0 12px 0;
        font-size: 14px;
        font-weight: 600;
        color: #1e293b;
      }

      .med-details {
        margin-bottom: 12px;

        .detail-item {
          display: block;
          margin-bottom: 4px;
          font-size: 13px;
          color: #64748b;
        }
      }

      .med-note {
        font-size: 13px;
        color: #64748b;
        background: rgba(2, 132, 199, 0.05);
        padding: 8px 12px;
        border-radius: 8px;
      }
    }

    .med-actions {
      display: flex;
      gap: 8px;
      margin-left: 16px;
    }
  }

  .empty-state {
    text-align: center;
    padding: 60px 20px;
    color: #64748b;

    .empty-icon {
      font-size: 48px;
      margin-bottom: 16px;
    }

    .empty-text {
      font-size: 14px;
    }
  }
}

.record-list {
  .record-item {
    background: #f9fafb;
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 16px;
    border-left: 4px solid #16a34a;
    transition: all 0.25s ease;

    &:hover {
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      transform: translateY(-2px);
    }

    .record-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;

      h4 {
        margin: 0;
        font-size: 14px;
        font-weight: 600;
        color: #1e293b;
      }

      .record-date {
        font-size: 12px;
        color: #64748b;
      }
    }

    .record-details {
      margin-bottom: 16px;

      .detail-item {
        display: block;
        margin-bottom: 4px;
        font-size: 13px;
        color: #64748b;
      }
    }

    .record-actions {
      display: flex;
      gap: 8px;
      justify-content: flex-end;
    }
  }

  .empty-state {
    text-align: center;
    padding: 60px 20px;
    color: #64748b;

    .empty-icon {
      font-size: 48px;
      margin-bottom: 16px;
    }

    .empty-text {
      font-size: 14px;
    }
  }
}

// 弹窗样式
.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;

  .modal-content {
    background: white;
    border-radius: 12px;
    width: 90%;
    max-width: 600px;
    max-height: 80vh;
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

      .btn-close {
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

      .form-row {
        display: flex;
        flex-wrap: wrap;
        gap: 16px;
        margin-bottom: 16px;

        .form-group {
          flex: 1;
          min-width: 200px;

          &.full-width {
            flex: 100%;
          }

          label {
            display: block;
            margin-bottom: 8px;
            font-weight: 500;
            color: #1e293b;
          }

          .form-control {
            width: 100%;
            padding: 8px 12px;
            border-radius: 12px;
            border: 1px solid #e2e8f0;
            font-size: 14px;

            &:focus {
              outline: none;
              border-color: #2563eb;
              box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.1);
            }

            &[type="date"] {
              padding: 6px 12px;
            }
          }

          textarea {
            resize: vertical;
            min-height: 80px;
          }
        }
      }
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      padding: 20px;
      border-top: 1px solid #e2e8f0;
    }
  }
}

// 动画效果
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

// 响应式设计
@media (max-width: 768px) {
  .filter-card {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;

    .filter-item {
      width: 100%;

      .form-control {
        flex: 1;
        min-width: auto;
      }
    }
  }

  .tab-container {
    .tab-header {
      overflow-x: auto;
      white-space: nowrap;

      .tab-btn {
        padding: 12px 16px;
        font-size: 13px;
      }
    }
  }

  .info-form,
  .modal-body {
    .form-row {
      .form-group {
        flex: 100%;
      }
    }
  }

  .medication-item,
  .record-item {
    flex-direction: column;
    align-items: flex-start;

    .med-actions,
    .record-actions {
      margin-left: 0;
      margin-top: 16px;
      width: 100%;
      display: flex;

      .btn {
        flex: 1;
      }
    }
  }

  .modal {
    .modal-content {
      width: 95%;
      margin: 20px;

      .modal-footer {
        flex-direction: column;

        .btn {
          width: 100%;
        }
      }
    }
  }
}
</style>