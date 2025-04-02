const axios = require('axios');
const cheerio = require('cheerio');
const { HttpsProxyAgent } = require('https-proxy-agent');

/**
 * 爬取 GitHub Trending 页面数据
 * @param {string} period - 时间周期：'daily', 'weekly', 'monthly'
 * @param {string} proxyUrl - 代理服务器URL，例如 http://127.0.0.1:7890
 * @returns {Promise<Array>} 仓库数据数组
 */
async function scrapeGithubTrending(period, proxyUrl = '' ) {
  try {
    // 根据时间周期确定URL
    const periodParam = period;
    const url = `https://github.com/trending?since=${periodParam}`;
    
    // 配置请求选项
    const options = {
      headers: {
        'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'accept-encoding': 'gzip, deflate, br',
        'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8',
        'cache-control': 'no-cache',
        'cookie': `_device_id=139fa1f8597a2c55d66e9d07cdff0759; _ga=GA1.2.1478865141.1706430277; _octo=GH1.1.752167321.1733315462; GHCC=Required:1-Analytics:1-SocialMedia:1-Advertising:1; MicrosoftApplicationsTelemetryDeviceId=09c4ebf1-a2ec-440e-b2d8-276f2be1ad35; color_mode=%7B%22color_mode%22%3A%22dark%22%2C%22light_theme%22%3A%7B%22name%22%3A%22light%22%2C%22color_mode%22%3A%22light%22%7D%2C%22dark_theme%22%3A%7B%22name%22%3A%22dark%22%2C%22color_mode%22%3A%22dark%22%7D%7D; cpu_bucket=xlg; preferred_color_mode=light; tz=Asia%2FShanghai; saved_user_sessions=; logged_in=no;`,
        'pragma': 'no-cache',
        'sec-ch-ua': '"Not(A:Brand";v="99", "Google Chrome";v="133", "Chromium";v="133"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'sec-fetch-dest': 'document',
        'sec-fetch-mode': 'navigate',
        'sec-fetch-site': 'same-origin',
        'sec-fetch-user': '?1',
        'upgrade-insecure-requests': '1',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36'
      },
      timeout: 30000 // 30秒超时
    };
    
    // 如果提供了代理URL，则配置代理
    if (proxyUrl) {
      console.log(`使用代理: ${proxyUrl}`);
      options.httpsAgent = new HttpsProxyAgent(proxyUrl);
    }
    
    // 发送请求获取页面内容
    console.log(`正在获取 ${period} 趋势数据...`);
    const response = await axios.get(url, options);
    
    // 使用cheerio解析HTML
    const $ = cheerio.load(response.data);
    const repositories = [];
    
    // 选择所有仓库项
    $('article.Box-row').each((index, element) => {
      try {
        // 提取仓库名称和作者
        const titleElement = $(element).find('h2 a');
        const repoPath = titleElement.attr('href').substring(1); // 移除开头的斜杠
        const [author, repoName] = repoPath.split('/');
        
        // 提取描述
        const description = $(element).find('p').text().trim();
        
        // 提取编程语言
        const language = $(element).find('[itemprop="programmingLanguage"]').text().trim();
        
        // 提取星标数
        const stars = $(element).find('a[href$="/stargazers"]').text().trim();
        
        // 提取今日新增星标数
        const starsToday = $(element).find('span.d-inline-block.float-sm-right').text().trim();
        
        // 提取分叉数
        const forks = $(element).find('a[href$="/forks"]').text().trim();
        
        repositories.push({
          author,
          repoName,
          repoUrl: `https://github.com/${repoPath}`,
          description,
          language,
          stars,
          starsToday,
          forks,
          period,
          timestamp: new Date().toISOString()
        });
      } catch (itemError) {
        console.error(`解析第 ${index + 1} 个仓库时出错:`, itemError);
      }
    });
    
    console.log(`成功获取 ${repositories.length} 个仓库数据`);
    return repositories;
  } catch (error) {
    console.error('爬取GitHub Trending失败:', error);
    return []; // 出错时返回空数组，避免程序崩溃
  }
}

module.exports = {
  scrapeGithubTrending
};