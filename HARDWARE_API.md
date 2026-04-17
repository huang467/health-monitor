# 老人健康监测系统 - 硬件对接接口文档

> 文档版本：v1.0
> 更新日期：2026-02-06
> 适用范围：硬件设备对接、后端接口开发

---

## 目录

1. [系统概述](#系统概述)
2. [数据库设计](#数据库设计)
3. [硬件设备接口](#硬件设备接口)
4. [后端API接口](#后端api接口)
5. [安全规范](#安全规范)
6. [开发环境配置](#开发环境配置)
7. [部署指南](#部署指南)

---

## 系统概述

### 业务架构

```
┌─────────────────────────────────────────────────────────────────┐
│                        系统架构图                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────┐     ┌──────────┐     ┌──────────┐                │
│  │ 硬件设备 │────▶│  数据库   │◀────│  后端API  │                │
│  └──────────┘     └──────────┘     └──────────┘                │
│                         │                 │                    │
│                         ▼                 ▼                    │
│                    ┌─────────────────────────────┐             │
│                    │        家属端Web            │             │
│                    └─────────────────────────────┘             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 核心功能

1. **硬件数据采集**：智能设备实时采集老人健康数据
2. **数据存储**：健康数据持久化存储
3. **健康预警**：异常数据自动预警
4. **家属查看**：家属实时查看老人健康数据
5. **服务预约**：社区健康服务预约

---

## 数据库设计

### 1. 用户表 (users)

| 字段名 | 类型 | 说明 | 备注 |
|--------|------|------|------|
| id | BIGINT | 用户ID | 主键，自增 |
| phone | VARCHAR(20) | 手机号 | 唯一索引 |
| password | VARCHAR(255) | 密码 | 加密存储 |
| name | VARCHAR(50) | 姓名 | |
| role | VARCHAR(20) | 角色 | family/admin |
| created_at | DATETIME | 创建时间 | |
| updated_at | DATETIME | 更新时间 | |

```sql
CREATE TABLE users (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  phone VARCHAR(20) UNIQUE NOT NULL COMMENT '手机号',
  password VARCHAR(255) NOT NULL COMMENT '密码（加密）',
  name VARCHAR(50) COMMENT '姓名',
  role VARCHAR(20) DEFAULT 'family' COMMENT '角色：family/admin',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_phone (phone)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';
```

### 2. 老人表 (elderly)

| 字段名 | 类型 | 说明 | 备注 |
|--------|------|------|------|
| id | VARCHAR(20) | 老人ID | 主键，硬件设备ID |
| name | VARCHAR(50) | 姓名 | |
| gender | VARCHAR(10) | 性别 | 男/女 |
| age | INT | 年龄 | |
| id_card | VARCHAR(18) | 身份证号 | |
| phone | VARCHAR(20) | 联系电话 | |
| address | VARCHAR(200) | 家庭住址 | |
| chronic_diseases | JSON | 慢性病 | JSON数组 |
| device_id | VARCHAR(50) | 设备ID | 关联硬件设备 |
| device_status | VARCHAR(20) | 设备状态 | online/offline |
| bind_date | DATE | 绑定日期 | |
| created_at | DATETIME | 创建时间 | |
| updated_at | DATETIME | 更新时间 | |

```sql
CREATE TABLE elderly (
  id VARCHAR(20) PRIMARY KEY COMMENT '老人ID（对应硬件设备ID）',
  name VARCHAR(50) NOT NULL COMMENT '姓名',
  gender VARCHAR(10) COMMENT '性别',
  age INT COMMENT '年龄',
  id_card VARCHAR(18) COMMENT '身份证号',
  phone VARCHAR(20) COMMENT '联系电话',
  address VARCHAR(200) COMMENT '家庭住址',
  chronic_diseases JSON COMMENT '慢性病列表',
  device_id VARCHAR(50) COMMENT '设备ID',
  device_status VARCHAR(20) DEFAULT 'offline' COMMENT '设备状态',
  bind_date DATE COMMENT '绑定日期',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_device_id (device_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='老人表';
```

### 3. 家属老人关联表 (family_elderly_binding)

| 字段名 | 类型 | 说明 | 备注 |
|--------|------|------|------|
| id | BIGINT | 关联ID | 主键，自增 |
| family_id | BIGINT | 家属用户ID | 外键关联users表 |
| elderly_id | VARCHAR(20) | 老人ID | 外键关联elderly表 |
| relationship | VARCHAR(20) | 关系 | 父子/母女/夫妻等 |
| is_primary | TINYINT | 是否主要联系人 | 0-否，1-是 |
| created_at | DATETIME | 创建时间 | |

```sql
CREATE TABLE family_elderly_binding (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  family_id BIGINT NOT NULL COMMENT '家属用户ID',
  elderly_id VARCHAR(20) NOT NULL COMMENT '老人ID',
  relationship VARCHAR(20) COMMENT '关系',
  is_primary TINYINT DEFAULT 0 COMMENT '是否主要联系人',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (family_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (elderly_id) REFERENCES elderly(id) ON DELETE CASCADE,
  UNIQUE KEY uk_family_elderly (family_id, elderly_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='家属老人关联表';
```

### 4. 健康数据表 (health_data)

| 字段名 | 类型 | 说明 | 备注 |
|--------|------|------|------|
| id | BIGINT | 数据ID | 主键，自增 |
| elderly_id | VARCHAR(20) | 老人ID | 外键 |
| heart_rate | INT | 心率 | 次/分钟 |
| blood_pressure_systolic | INT | 收缩压 | mmHg |
| blood_pressure_diastolic | INT | 舒张压 | mmHg |
| blood_oxygen | INT | 血氧 | % |
| body_temperature | DECIMAL | 体温 | ℃ |
| data_source | VARCHAR(20) | 数据来源 | hardware/manual |
| device_id | VARCHAR(50) | 设备ID | |
| collected_at | DATETIME | 采集时间 | |
| created_at | DATETIME | 创建时间 | |

```sql
CREATE TABLE health_data (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  elderly_id VARCHAR(20) NOT NULL COMMENT '老人ID',
  heart_rate INT COMMENT '心率（次/分钟）',
  blood_pressure_systolic INT COMMENT '收缩压',
  blood_pressure_diastolic INT COMMENT '舒张压',
  blood_oxygen INT COMMENT '血氧饱和度',
  body_temperature DECIMAL(4,1) COMMENT '体温（℃）',
  data_source VARCHAR(20) DEFAULT 'hardware' COMMENT '数据来源',
  device_id VARCHAR(50) COMMENT '设备ID',
  collected_at DATETIME COMMENT '采集时间',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (elderly_id) REFERENCES elderly(id) ON DELETE CASCADE,
  INDEX idx_elderly_collected (elderly_id, collected_at DESC),
  INDEX idx_device (device_id),
  INDEX idx_collected_at (collected_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='健康数据表';
```

### 5. 健康预警表 (health_warnings)

| 字段名 | 类型 | 说明 | 备注 |
|--------|------|------|------|
| id | BIGINT | 预警ID | 主键，自增 |
| elderly_id | VARCHAR(20) | 老人ID | 外键 |
| warning_type | VARCHAR(50) | 预警类型 | 心率异常/血压异常/血氧偏低 |
| warning_level | VARCHAR(20) | 预警级别 | low/medium/high |
| warning_desc | VARCHAR(500) | 预警描述 | |
| current_value | VARCHAR(50) | 当前值 | |
| normal_range | VARCHAR(50) | 正常范围 | |
| status | VARCHAR(20) | 状态 | pending/processing/resolved |
| handled_by | BIGINT | 处理人ID | |
| handled_at | DATETIME | 处理时间 | |
| created_at | DATETIME | 创建时间 | |

```sql
CREATE TABLE health_warnings (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  elderly_id VARCHAR(20) NOT NULL COMMENT '老人ID',
  warning_type VARCHAR(50) COMMENT '预警类型',
  warning_level VARCHAR(20) COMMENT '预警级别：low/medium/high',
  warning_desc VARCHAR(500) COMMENT '预警描述',
  current_value VARCHAR(50) COMMENT '当前值',
  normal_range VARCHAR(50) COMMENT '正常范围',
  status VARCHAR(20) DEFAULT 'pending' COMMENT '状态',
  handled_by BIGINT COMMENT '处理人ID',
  handled_at DATETIME COMMENT '处理时间',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (elderly_id) REFERENCES elderly(id) ON DELETE CASCADE,
  FOREIGN KEY (handled_by) REFERENCES users(id),
  INDEX idx_elderly_status (elderly_id, status),
  INDEX idx_created_at (created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='健康预警表';
```

### 6. 服务预约表 (service_orders)

| 字段名 | 类型 | 说明 | 备注 |
|--------|------|------|------|
| id | VARCHAR(30) | 订单号 | 主键 |
| elderly_id | VARCHAR(20) | 老人ID | 外键 |
| family_id | BIGINT | 家属ID | 外键 |
| service_type | VARCHAR(50) | 服务类型 | 体检/随访/护理 |
| service_date | DATE | 预约日期 | |
| service_time | VARCHAR(20) | 预约时间段 | 上午/下午 |
| remark | VARCHAR(500) | 备注 | |
| status | VARCHAR(20) | 状态 | pending/confirmed/completed/cancelled |
| assigned_staff_id | BIGINT | 指派人员ID | |
| created_at | DATETIME | 创建时间 | |
| updated_at | DATETIME | 更新时间 | |

```sql
CREATE TABLE service_orders (
  id VARCHAR(30) PRIMARY KEY COMMENT '订单号',
  elderly_id VARCHAR(20) NOT NULL COMMENT '老人ID',
  family_id BIGINT NOT NULL COMMENT '家属ID',
  service_type VARCHAR(50) COMMENT '服务类型',
  service_date DATE COMMENT '预约日期',
  service_time VARCHAR(20) COMMENT '预约时间段',
  remark VARCHAR(500) COMMENT '备注',
  status VARCHAR(20) DEFAULT 'pending' COMMENT '状态',
  assigned_staff_id BIGINT COMMENT '指派人员ID',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (elderly_id) REFERENCES elderly(id),
  FOREIGN KEY (family_id) REFERENCES users(id),
  INDEX idx_elderly (elderly_id),
  INDEX idx_family (family_id),
  INDEX idx_status_date (status, service_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='服务预约表';
```

### 7. 设备表 (devices)

| 字段名 | 类型 | 说明 | 备注 |
|--------|------|------|------|
| id | VARCHAR(50) | 设备ID | 主键 |
| device_name | VARCHAR(100) | 设备名称 | |
| device_type | VARCHAR(50) | 设备类型 | 手环/血压计/血氧仪 |
| elderly_id | VARCHAR(20) | 绑定老人ID | 外键 |
| mac_address | VARCHAR(50) | MAC地址 | |
| firmware_version | VARCHAR(50) | 固件版本 | |
| last_online | DATETIME | 最后在线时间 | |
| status | VARCHAR(20) | 状态 | online/offline/maintenance |
| created_at | DATETIME | 创建时间 | |
| updated_at | DATETIME | 更新时间 | |

```sql
CREATE TABLE devices (
  id VARCHAR(50) PRIMARY KEY COMMENT '设备ID',
  device_name VARCHAR(100) COMMENT '设备名称',
  device_type VARCHAR(50) COMMENT '设备类型',
  elderly_id VARCHAR(20) COMMENT '绑定老人ID',
  mac_address VARCHAR(50) COMMENT 'MAC地址',
  firmware_version VARCHAR(50) COMMENT '固件版本',
  last_online DATETIME COMMENT '最后在线时间',
  status VARCHAR(20) DEFAULT 'offline' COMMENT '设备状态',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (elderly_id) REFERENCES elderly(id),
  INDEX idx_elderly (elderly_id),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='设备表';
```

---

## 硬件设备接口

### 1. 设备注册接口

设备首次使用时需要注册，获取设备认证信息。

**接口地址**: `POST /api/device/register`

**请求头**:
```
Content-Type: application/json
```

**请求参数**:
```json
{
  "device_id": "DEV001",
  "device_type": "watch",
  "device_name": "健康手环V1",
  "mac_address": "00:1A:2B:3C:4D:5E",
  "firmware_version": "1.0.0"
}
```

**响应示例**:
```json
{
  "code": 200,
  "data": {
    "device_id": "DEV001",
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "token_expires_in": 86400
  },
  "msg": "设备注册成功"
}
```

**错误响应**:
```json
{
  "code": 400,
  "msg": "设备ID已存在"
}
```

---

### 2. 设备认证接口

设备每次上传数据前需要验证身份。

**接口地址**: `POST /api/device/auth`

**请求头**:
```
Content-Type: application/json
```

**请求参数**:
```json
{
  "device_id": "DEV001",
  "access_token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**响应示例**:
```json
{
  "code": 200,
  "data": {
    "elderly_id": "1001",
    "device_status": "online"
  },
  "msg": "认证成功"
}
```

---

### 3. 健康数据上传接口

设备定时上传健康数据到服务器。

**接口地址**: `POST /api/device/health/upload`

**请求头**:
```
Content-Type: application/json
Authorization: Bearer {access_token}
```

**请求参数**:
```json
{
  "elderly_id": "1001",
  "data": [
    {
      "type": "heart_rate",
      "value": 75,
      "unit": "bpm",
      "timestamp": "2026-02-06T10:30:00Z"
    },
    {
      "type": "blood_pressure",
      "value": {
        "systolic": 130,
        "diastolic": 80
      },
      "unit": "mmHg",
      "timestamp": "2026-02-06T10:30:00Z"
    },
    {
      "type": "blood_oxygen",
      "value": 98,
      "unit": "%",
      "timestamp": "2026-02-06T10:30:00Z"
    },
    {
      "type": "body_temperature",
      "value": 36.5,
      "unit": "℃",
      "timestamp": "2026-02-06T10:30:00Z"
    }
  ]
}
```

**响应示例**:
```json
{
  "code": 200,
  "data": {
    "uploaded_count": 4,
    "warnings": [
      {
        "type": "blood_pressure",
        "message": "血压偏高，请注意"
      }
    ]
  },
  "msg": "数据上传成功"
}
```

---

### 4. 设备心跳保活接口

设备定时发送心跳，保持在线状态。

**接口地址**: `POST /api/device/heartbeat`

**请求头**:
```
Content-Type: application/json
Authorization: Bearer {access_token}
```

**请求参数**:
```json
{
  "device_id": "DEV001",
  "timestamp": "2026-02-06T10:30:00Z",
  "battery_level": 85,
  "signal_strength": -60
}
```

**响应示例**:
```json
{
  "code": 200,
  "data": {
    "sync_time": "2026-02-06T10:30:01Z",
    "commands": []
  },
  "msg": "心跳成功"
}
```

---

### 5. 设备配置下发接口

设备定时获取服务器下发的配置和指令。

**接口地址**: `GET /api/device/config`

**请求头**:
```
Authorization: Bearer {access_token}
```

**请求参数**:
```
device_id=DEV001
```

**响应示例**:
```json
{
  "code": 200,
  "data": {
    "collect_interval": 300,
    "upload_interval": 600,
    "health_threshold": {
      "heart_rate": { "min": 60, "max": 100 },
      "blood_pressure": { "systolic_max": 140, "diastolic_max": 90 },
      "blood_oxygen_min": 95
    },
    "commands": []
  },
  "msg": "获取配置成功"
}
```

---

### 6. 设备固件升级接口

设备获取固件升级信息。

**接口地址**: `GET /api/device/firmware/check`

**请求头**:
```
Authorization: Bearer {access_token}
```

**请求参数**:
```
device_id=DEV001&current_version=1.0.0
```

**响应示例**:
```json
{
  "code": 200,
  "data": {
    "has_update": true,
    "latest_version": "1.1.0",
    "update_url": "https://download.example.com/firmware/v1.1.0.bin",
    "file_size": 1024000,
    "md5": "a1b2c3d4e5f6...",
    "release_notes": "修复已知问题，优化性能"
  },
  "msg": "检查完成"
}
```

---

## 后端API接口

### 1. 认证接口

#### 1.1 家属登录

**接口地址**: `POST /api/auth/family/login`

**请求参数**:
```json
{
  "phone": "13800000001",
  "password": "123456"
}
```

**响应示例**:
```json
{
  "code": 200,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
    "user_info": {
      "id": 1,
      "phone": "13800000001",
      "name": "张家属"
    }
  },
  "msg": "登录成功"
}
```

---

#### 1.2 管理员登录

**接口地址**: `POST /api/auth/admin/login`

**请求参数**:
```json
{
  "username": "admin",
  "password": "123456"
}
```

**响应示例**:
```json
{
  "code": 200,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "admin_info": {
      "id": 1,
      "username": "admin",
      "role": "admin"
    }
  },
  "msg": "登录成功"
}
```

---

#### 1.3 退出登录

**接口地址**: `POST /api/auth/logout`

**请求头**:
```
Authorization: Bearer {token}
```

**响应示例**:
```json
{
  "code": 200,
  "msg": "退出成功"
}
```

---

#### 1.4 刷新Token

**接口地址**: `POST /api/auth/refresh`

**请求参数**:
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**响应示例**:
```json
{
  "code": 200,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIs..."
  },
  "msg": "刷新成功"
}
```

---

### 2. 家属端接口

#### 2.1 获取家属关联的老人列表

**接口地址**: `GET /api/family/elderly-list`

**请求头**:
```
Authorization: Bearer {token}
```

**响应示例**:
```json
{
  "code": 200,
  "data": {
    "list": [
      {
        "id": "1001",
        "name": "张三",
        "age": 72,
        "gender": "男",
        "relationship": "父子",
        "chronic_diseases": ["高血压"],
        "device_status": "online",
        "bind_date": "2025-12-01",
        "last_health_check": "2026-01-28"
      }
    ],
    "total": 1
  },
  "msg": "获取成功"
}
```

---

#### 2.2 获取老人基本信息

**接口地址**: `GET /api/elderly/info`

**请求头**:
```
Authorization: Bearer {token}
```

**请求参数**:
```
elderly_id=1001
```

**响应示例**:
```json
{
  "code": 200,
  "data": {
    "elderly_id": "1001",
    "name": "张三",
    "age": 72,
    "gender": "男",
    "chronic_diseases": ["高血压"],
    "device_status": "online",
    "bind_date": "2025-12-01",
    "phone": "13800001111",
    "address": "北京市朝阳区XX小区"
  },
  "msg": "获取成功"
}
```

---

### 3. 健康数据接口

#### 3.1 获取实时健康数据

**接口地址**: `GET /api/health/realtime`

**请求头**:
```
Authorization: Bearer {token}
```

**请求参数**:
```
elderly_id=1001
```

**响应示例**:
```json
{
  "code": 200,
  "data": {
    "heart_rate": 75,
    "blood_pressure": "130/80",
    "blood_oxygen": 98,
    "body_temperature": 36.5,
    "update_time": "2026-02-06 10:30:00",
    "device_status": "online"
  },
  "msg": "获取成功"
}
```

---

#### 3.2 获取健康趋势数据

**接口地址**: `GET /api/health/trend`

**请求头**:
```
Authorization: Bearer {token}
```

**请求参数**:
```
elderly_id=1001&type=heart_rate&range=7
```

| 参数 | 类型 | 说明 |
|------|------|------|
| elderly_id | string | 老人ID |
| type | string | 数据类型：heartRate/bloodPressure/bloodOxygen |
| range | number | 时间范围：7/30（天） |

**响应示例**:
```json
{
  "code": 200,
  "data": {
    "dates": ["2月1日", "2月2日", "2月3日", "2月4日", "2月5日", "2月6日", "2月7日"],
    "values": [75, 78, 82, 72, 76, 80, 77],
    "unit": "次/分"
  },
  "msg": "获取成功"
}
```

---

#### 3.3 获取健康预警列表

**接口地址**: `GET /api/health/warnings`

**请求头**:
```
Authorization: Bearer {token}
```

**请求参数**:
```
elderly_id=1001&page=1&pageSize=20
```

**响应示例**:
```json
{
  "code": 200,
  "data": {
    "list": [
      {
        "id": "W001",
        "time": "2026-02-06 10:00:00",
        "type": "血压异常",
        "desc": "血压145/92 mmHg",
        "status": "未处理",
        "level": "high"
      }
    ],
    "total": 10,
    "page": 1,
    "pageSize": 20
  },
  "msg": "获取成功"
}
```

---

### 4. 服务预约接口

#### 4.1 创建服务预约

**接口地址**: `POST /api/service/order`

**请求头**:
```
Authorization: Bearer {token}
Content-Type: application/json
```

**请求参数**:
```json
{
  "elderly_id": "1001",
  "service_type": "体检",
  "service_date": "2026-02-10",
  "service_time": "上午",
  "remark": "需要血压检查"
}
```

**响应示例**:
```json
{
  "code": 200,
  "data": {
    "order_id": "ORD20260206100001",
    "status": "待确认",
    "message": "预约提交成功，社区将尽快联系您"
  },
  "msg": "创建成功"
}
```

---

#### 4.2 获取服务预约列表

**接口地址**: `GET /api/service/orders`

**请求头**:
```
Authorization: Bearer {token}
```

**请求参数**:
```
elderly_id=1001&page=1&pageSize=20
```

**响应示例**:
```json
{
  "code": 200,
  "data": {
    "list": [
      {
        "id": "ORD20260206100001",
        "service_type": "体检",
        "service_date": "2026-02-10",
        "service_time": "上午",
        "status": "待确认",
        "created_at": "2026-02-06 10:00:00"
      }
    ],
    "total": 1
  },
  "msg": "获取成功"
}
```

---

### 5. 管理员接口

#### 5.1 获取老人列表

**接口地址**: `GET /api/admin/elderly`

**请求头**:
```
Authorization: Bearer {admin_token}
```

**请求参数**:
```
page=1&pageSize=20&keyword=
```

**响应示例**:
```json
{
  "code": 200,
  "data": {
    "list": [
      {
        "id": "1001",
        "name": "张三",
        "age": 72,
        "gender": "男",
        "phone": "13800001111",
        "device_status": "online",
        "bind_date": "2025-12-01"
      }
    ],
    "total": 50
  },
  "msg": "获取成功"
}
```

---

#### 5.2 添加老人

**接口地址**: `POST /api/admin/elderly`

**请求头**:
```
Authorization: Bearer {admin_token}
Content-Type: application/json
```

**请求参数**:
```json
{
  "id": "1003",
  "name": "王五",
  "gender": "男",
  "age": 68,
  "phone": "13800002222",
  "chronic_diseases": ["糖尿病"],
  "device_id": "DEV003"
}
```

**响应示例**:
```json
{
  "code": 200,
  "data": {
    "elderly_id": "1003"
  },
  "msg": "添加成功"
}
```

---

#### 5.3 更新老人信息

**接口地址**: `PUT /api/admin/elderly/{elderly_id}`

**请求头**:
```
Authorization: Bearer {admin_token}
Content-Type: application/json
```

**请求参数**:
```json
{
  "name": "王五",
  "phone": "13800003333",
  "chronic_diseases": ["糖尿病", "高血压"]
}
```

**响应示例**:
```json
{
  "code": 200,
  "msg": "更新成功"
}
```

---

#### 5.4 删除老人

**接口地址**: `DELETE /api/admin/elderly/{elderly_id}`

**请求头**:
```
Authorization: Bearer {admin_token}
```

**响应示例**:
```json
{
  "code": 200,
  "msg": "删除成功"
}
```

---

#### 5.5 绑定家属

**接口地址**: `POST /api/admin/family-bind`

**请求头**:
```
Authorization: Bearer {admin_token}
Content-Type: application/json
```

**请求参数**:
```json
{
  "elderly_id": "1001",
  "family_phone": "13800000001",
  "relationship": "父子"
}
```

**响应示例**:
```json
{
  "code": 200,
  "msg": "绑定成功"
}
```

---

## 安全规范

### 1. 认证机制

- 使用 JWT (JSON Web Token) 进行用户认证
- Token 有效期：访问令牌 2 小时，刷新令牌 7 天
- 设备认证使用 Access Token + MAC 地址双重验证

### 2. 数据加密

- 密码使用 bcrypt 加密存储
- 敏感数据传输使用 HTTPS
- 设备 Token 使用 JWT 签名验证

### 3. 权限控制

- 家属只能查看已绑定老人的数据
- 管理员可以查看所有老人数据
- 设备只能上传自己绑定的老人数据

### 4. 数据校验

- 所有输入参数必须进行格式校验
- SQL 注入防护
- XSS 攻击防护

---

## 开发环境配置

### 1. 前端配置

编辑 `src/config/api.config.js`：

```javascript
const API_CONFIG = {
  development: {
    baseURL: 'http://localhost:8081',  // 后端地址
    timeout: 10000,
    hardwareBaseURL: 'http://localhost:8080'  // 硬件设备地址
  }
};
```

### 2. 后端技术栈建议

| 技术 | 说明 |
|------|------|
| 后端语言 | Java (Spring Boot) / Node.js (Express) / Python (FastAPI) |
| 数据库 | MySQL 8.0+ |
| 缓存 | Redis 6.0+ |
| 消息队列 | RabbitMQ / Kafka (可选) |
| 部署 | Docker + Nginx |

### 3. 对接步骤

1. **数据库初始化**
   ```bash
   # 执行数据库脚本
   mysql -u root -p < database.sql
   ```

2. **后端启动**
   ```bash
   # 安装依赖
   npm install

   # 启动服务
   npm run dev
   ```

3. **前端修改 API 配置**
   - 修改 `src/config/api.config.js` 中的 `baseURL`
   - 取消注释 API 文件中的真实接口调用

4. **测试接口**
   - 使用 Postman 测试后端接口
   - 检查前端是否正常调用接口

---

## 部署指南

### 1. 生产环境配置

编辑 `src/config/api.config.js`：

```javascript
const API_CONFIG = {
  production: {
    baseURL: 'https://api.yourdomain.com',
    timeout: 15000,
    hardwareBaseURL: 'https://hardware.yourdomain.com'
  }
};
```

### 2. 前端构建

```bash
# 生产环境构建
npm run build

# 构建产物在 dist 目录
```

### 3. 部署到服务器

```bash
# 使用 Nginx 部署静态文件
server {
  listen 80;
  server_name family.yourdomain.com;

  location / {
    root /var/www/elderly-health-family/dist;
    index index.html;
    try_files $uri $uri/ /index.html;
  }

  location /api {
    proxy_pass http://localhost:8081;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
  }
}
```

---

## 附录

### A. 错误码定义

| 错误码 | 说明 |
|--------|------|
| 200 | 成功 |
| 400 | 请求参数错误 |
| 401 | 未授权/Token无效 |
| 403 | 权限不足 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

### B. WebSocket 接口（可选）

用于实时推送健康数据和预警信息。

**连接地址**: `wss://api.yourdomain.com/ws`

**订阅格式**:
```json
{
  "action": "subscribe",
  "topic": "health_data.1001"
}
```

**推送数据示例**:
```json
{
  "type": "health_update",
  "elderly_id": "1001",
  "data": {
    "heart_rate": 78,
    "blood_pressure": "132/82",
    "timestamp": "2026-02-06T10:30:00Z"
  }
}
```

---

## 联系方式

如有问题，请联系开发团队。
