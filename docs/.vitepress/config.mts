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
      { text: '后端', link: '/backend/microservice/bulkhead' },
      { text: 'AI', link: '/ai/langchain/agent_tool' },
    ],

    sidebar: {
      '/backend/': [
        {
          text: '微服务架构',
          items: [
            {
              text: '服务容错',
              items: [
                { text: '断路器模式', link: '/backend/microservice/circuit_breaker' },
                { text: '舱壁模式', link: '/backend/microservice/bulkhead' },
              ],
            },
          ],
        },
      ],
      '/ai/': [
        {
          text: 'LangChain',
          items: [
            { text: '智能体工具', link: '/ai/langchain/agent_tool' },
          ],
        },
      ],
    },

    socialLinks: [{ icon: 'github', link: 'https://github.com/samanhappy' }],
  },
})
