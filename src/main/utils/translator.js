const axios = require('axios');
const { HttpsProxyAgent } = require('https-proxy-agent');

/**
 * 使用Google Gemini模型翻译文本
 * @param {string} text - 需要翻译的文本
 * @param {string} apiKey - OpenRouter API密钥
 * @param {string} proxyUrl - 代理服务器URL
 * @returns {Promise<string>} 翻译后的文本
 */
async function translateText(text, apiKey, proxyUrl) {
  if (!text || text.trim() === '') {
    return '';
  }
  
  try {
    const options = {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    };
    
    // 如果提供了代理URL，则配置代理
    if (proxyUrl) {
      console.log(`翻译使用代理: ${proxyUrl}`);
      options.httpsAgent = new HttpsProxyAgent(proxyUrl);
    }
    
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'deepseek/deepseek-r1-distill-llama-70b:free',
        messages: [
          {
            role: 'system',
            content: '你是一个专业的翻译助手，请将英文技术文本准确翻译成中文，保留原文中的专有名词、代码片段和技术术语。'
          },
          {
            role: 'user',
            content: `请将以下文本翻译成中文：\n\n${text}`
          }
        ]
      },
      options
    );

    console.log('API响应:', response.data);
    console.log(response.data.choices[0].message.content);
    
    return response.data.choices[0].message.content.trim();
  } catch (error) {
    console.error('翻译失败:', error.message);
    if (error.response) {
      console.error('API响应:', error.response.data);
    }
    return text; // 翻译失败时返回原文
  }
}

/**
 * 批量翻译仓库数据
 * @param {Array} repositories - 仓库数据数组
 * @param {string} apiKey - OpenRouter API密钥
 * @param {string} proxyUrl - 代理服务器URL
 * @returns {Promise<Array>} 翻译后的仓库数据数组
 */
async function translateBatch(descriptions, apiKey, proxyUrl) {
  if (!descriptions || descriptions.length === 0) {
    return [];
  }

  try {
    const options = {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    };
    
    if (proxyUrl) {
      options.httpsAgent = new HttpsProxyAgent(proxyUrl);
    }
    
    // 构建批量翻译的提示
    const batchText = JSON.stringify(descriptions);

    console.log(`批量翻译使用代理: ${batchText}`);
    
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'deepseek/deepseek-r1-distill-llama-70b:free',
        messages: [
          {
            role: 'system',
            content: '你是一个专业的翻译助手。我会给你一个包含英文描述的JSON数组，请将所有描述翻译成中文，并返回一个相同结构的JSON数组。保留原文中的专有名词、代码片段和技术术语。'
          },
          {
            role: 'user',
            content: `请将以下JSON数组中的描述翻译成中文：\n\n${batchText}`
          }
        ]
      },
      options
    );

    console.log('AI结果', response.data.choices[0].message.content.trim());

    // 清理返回内容中的 <think> 标签及其内容，以及 JSON 代码块标记
    let cleanContent = response.data.choices[0].message.content.trim()
      .replace(/<think>.*?<\/think>/gs, '')
      .replace(/^```json\s*/, '')  // 移除开头的 ```json
      .replace(/```$/, '')         // 移除结尾的 ```
      .trim();

    const translatedTexts = JSON.parse(cleanContent);
    return translatedTexts;
  } catch (error) {
    console.error('批量翻译失败:', error.message);
    return descriptions; // 翻译失败时返回原文数组
  }
}

async function translateRepositories(repositories, apiKey, proxyUrl) {
  try {
    // 提取所有描述
    const descriptions = repositories.map(repo => repo.description || '');
    
    // 批量翻译
    const translatedDescriptions = await translateBatch(descriptions, apiKey, proxyUrl);
    
    // 将翻译结果合并回仓库数据
    return repositories.map((repo, index) => ({
      ...repo,
      originalDescription: repo.description,
      description: translatedDescriptions[index] || repo.description
    }));
  } catch (error) {
    console.error('处理仓库翻译失败:', error);
    return repositories;
  }
}

module.exports = {
  translateText,
  translateRepositories
};