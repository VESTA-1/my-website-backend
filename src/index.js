import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { createClient } from '@supabase/supabase-js';

const app = new Hono();

// 開啟 CORS：允許你的前端網頁來抓取資料
app.use('/api/*', cors());

// ✨ 新增：根目錄路由，用於健康檢查或歡迎訊息
app.get('/', (c) => {
  return c.json({
    message: '歡迎來到我的個人網站後端 API！',
    endpoints: [
      '/api/profile',
      '/api/projects'
    ]
  });
});

// 定義資料表名稱為常數，提高可維護性
const TABLE_NAMES = {
  PROFILE: 'profile',
  PROJECT: 'project',
};

// 建立一個輔助函數：每次有人呼叫 API 時，就幫我們連線到 Supabase
const getSupabase = (c) => {
  const { SUPABASE_URL, SUPABASE_KEY } = c.env;
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error("Supabase environment variables (SUPABASE_URL, SUPABASE_KEY) are not set.");
    throw new Error("Supabase configuration missing. Please check SUPABASE_URL and SUPABASE_KEY.");
  }

  return createClient(SUPABASE_URL, SUPABASE_KEY);
};

// 🌟 API 1：獲取個人資料
app.get('/api/profile', async (c) => {
  try {
    const supabase = getSupabase(c);
    const { data, error } = await supabase.from(TABLE_NAMES.PROFILE).select('*').single();
    
    if (error) throw error;
    return c.json(data || null);
  } catch (err) {
    return c.json({ error: err.message || "Failed to fetch profile data." }, 500);
  }
});

// 🌟 API 2：獲取專案列表
app.get('/api/project', async (c) => {
  try {
    const supabase = getSupabase(c);
    const { data, error } = await supabase.from(TABLE_NAMES.PROJECT).select('*');
    
    if (error) throw error;
    return c.json(data || []);
  } catch (err) {
    return c.json({ error: err.message || "Failed to fetch projects data." }, 500);
  }
});

export default app;
