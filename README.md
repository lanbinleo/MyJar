# 效率存钱罐 (MyJar) 🏆✨

![GitHub stars](https://img.shields.io/github/stars/lanbinleo/MyJar)
![GitHub forks](https://img.shields.io/github/forks/lanbinleo/MyJar&color=green)
![GitHub issues](https://img.shields.io/github/issues/lanbinleo/MyJar&color=blue)

一个简单而强大的效率管理和激励工具，帮助您量化生活中的努力，将每日任务转换为可视化的积分。

## 📸 预览 

![预览1](/image/display1.png)
![预览2](/image/display2.png)

## 📝 简介

效率存钱罐是一个个人生产力激励系统，它通过将您完成的任务量化为积分来帮助您保持动力。您可以设置任务的权重、难度和花费时间，系统根据这些参数自动计算积分。积攒的积分可以用于购买您自己设定的奖励，形成一个完整的自激励循环。

## 🎯 目标用户群体

- 🧠 需要额外动力完成任务的学生和职场人士
- 📊 喜欢量化自己努力和进步的数据爱好者
- 🎮 偏好游戏化体验来提升生产力的用户
- 📱 希望通过积分系统培养良好习惯的人群

## ✨ 主要功能

### 💪 任务管理
- ✅ 添加带有详细信息的任务（标题、描述、权重、难度、时间、完成度）
- 📈 根据任务参数自动计算积分
- 📜 查看最近完成的任务历史
- 🗑️ 清空任务历史记录

### 📊 数据可视化
- 📈 积分趋势图表显示积分增长
- 🍩 任务分布图表按难度级别分类
- 📋 关键数据摘要（总任务数、总时长、平均难度、平均完成度）

### 🛒 积分商城
- 🏷️ 添加自定义奖励商品
- 💰 使用积分购买奖励
- 📦 管理奖励库存

### 💾 数据同步
- ☁️ 在不同设备间同步数据
- 🔄 通过简单的服务器设置在多设备间保持数据一致
- 👤 基于用户ID的数据隔离

### 📤 数据导入导出
- 💾 导出数据以备份
- 📥 导入之前的数据

## 🚀 快速开始

### 本地运行

1. 克隆仓库:
```bash
git clone https://github.com/your-username/efficiency-savings-jar.git
```

2. 进入项目目录:
```bash
cd efficiency-savings-jar
```

3. 安装依赖:
```bash
pip install fastapi uvicorn
```

4. 运行后端服务:
```bash
python app.py
```

5. 在浏览器中打开:
```
http://localhost:8000
```

### 部署到服务器

1. 安装依赖:
```bash
pip install fastapi uvicorn
```

2. 配置防火墙开放8000端口

3. 运行后端服务:
```bash
nohup python app.py &
```

4. 如果要作为系统服务运行，可以配置一个systemd服务:
```bash
sudo nano /etc/systemd/system/efficiency-jar.service
```

内容如下:
```
[Unit]
Description=Efficiency Savings Jar Service
After=network.target

[Service]
User=your-username
WorkingDirectory=/path/to/efficiency-savings-jar
ExecStart=/usr/bin/python /path/to/efficiency-savings-jar/app.py
Restart=always

[Install]
WantedBy=multi-user.target
```

5. 启用并启动服务:
```bash
sudo systemctl enable efficiency-jar
sudo systemctl start efficiency-jar
```

## 💻 技术栈

- 前端: 纯JavaScript, HTML5, CSS3
- 图表: Chart.js
- 后端: Python, FastAPI
- 存储: 本地存储 + JSON文件

## 🤝 贡献

欢迎提交问题或功能建议！如果您想贡献代码，请先开一个issue讨论您想改变的内容。

## ⚠️ 免责声明

此项目是AI与用户协作开发的成果，代码未经过严格的安全审查和性能优化。不建议在关键生产环境中使用，仅供学习和个人使用目的。数据同步功能使用简单的文件存储，没有实现强大的用户认证和安全措施，请勿存储敏感信息。

## 📜 许可证

MIT