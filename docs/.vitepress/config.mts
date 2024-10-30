import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: '青扬的数字世界',
  description: '记录个人生活、技术总结，每个个体都值得被记住',
  base: '/blog/',
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: '首页', link: '/' },
      { text: '后端', link: '/backend/microservice/failure' },
      { text: 'AI', link: '/ai/llm/moe' },
    ],

    sidebar: {
      '/backend/': [
        {
          text: '微服务架构',
          items: [
            {
              text: '服务容错',
              link: '/backend/microservice/failure',
            },
          ],
        },
        {
          text: 'JAVA',
          items: [
            {
              text: 'ReentrantReadWriteLock',
              link: '/backend/java/ReentrantReadWriteLock',
            },
          ],
        },
        {
          text: '网络',
          items: [
            {
              text: 'Incomplete Certificate Chain',
              link: '/backend/network/incomplete_certificate_chain',
            },
          ],
        },
      ],
      '/ai/': [
        {
          text: 'LLM',
          items: [{ text: 'Moe', link: '/ai/llm/moe' }],
        },
        {
          text: '开发工具',
          items: [{ text: 'Cursor', link: '/ai/develop/cursor' }],
        },
        {
          text: 'LangChain',
          items: [{ text: '智能体工具', link: '/ai/langchain/agent_tool' }],
        },
      ],
    },

    socialLinks: [{ icon: 'github', link: 'https://github.com/samanhappy' }],
  },
})
