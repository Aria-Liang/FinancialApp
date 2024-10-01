import React, { createContext, useState, useEffect } from 'react';

// 创建 AuthContext
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // 初始化时尝试从 localStorage 获取 userId
  const [userId, setUserId] = useState(() => {
    const savedUserId = localStorage.getItem('userId');
    return savedUserId ? JSON.parse(savedUserId) : null;
  });

  // 监控 userId 的变化，并将其持久化到 localStorage
  useEffect(() => {
    if (userId) {
      localStorage.setItem('userId', JSON.stringify(userId)); // 保存到 localStorage
    } else {
      localStorage.removeItem('userId'); // 如果 userId 为 null，删除
    }
  }, [userId]);

  return (
    <AuthContext.Provider value={{ userId, setUserId }}>
      {children}
    </AuthContext.Provider>
  );
};
