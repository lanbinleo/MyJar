from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
import json
import os
from typing import Dict, Any
from pydantic import BaseModel

app = FastAPI()

# 配置 CORS 允许前端跨域访问
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 允许所有源，生产环境请限制为特定域名
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 数据存储目录
DATA_DIR = "user_data"

# 确保数据存储目录存在
os.makedirs(DATA_DIR, exist_ok=True)

class SyncData(BaseModel):
    tasks: list = []
    products: list = []
    timestamp: str = ""

# 保存用户数据
@app.post("/{user_id}/save")
async def save_user_data(user_id: str, data: Dict[str, Any] = Body(...)):
    # 检查用户ID是否合法
    if not user_id.isalnum():
        raise HTTPException(status_code=400, detail="无效的用户ID")
    
    file_path = os.path.join(DATA_DIR, f"{user_id}.json")
    
    try:
        # 保存数据
        with open(file_path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        return {"status": "success", "message": "数据保存成功"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"保存失败: {str(e)}")

# 获取用户数据
@app.get("/{user_id}/get")
async def get_user_data(user_id: str):
    # 检查用户ID是否合法
    if not user_id.isalnum():
        raise HTTPException(status_code=400, detail="无效的用户ID")
    
    file_path = os.path.join(DATA_DIR, f"{user_id}.json")
    
    # 检查文件是否存在
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="未找到用户数据")
    
    try:
        # 读取数据
        with open(file_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"读取失败: {str(e)}")

# 健康检查接口
@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "效率存钱罐同步服务"}

# index，main.js, style.css, favicon.ico
@app.get("/")
async def index():
    # 返回 index.html
    return FileResponse("index.html")

@app.get("/main.js")
async def main_js():
    # 返回 main.js
    return FileResponse("main.js")

@app.get("/style.css")
async def style_css():
    # 返回 style.css
    return FileResponse("style.css")

@app.get("/favicon.ico")
async def favicon():
    # 返回 favicon.ico
    return FileResponse("favicon.ico")

if __name__ == "__main__":
    import uvicorn
    # uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
    uvicorn.run(app, host="localhost", port=8000)