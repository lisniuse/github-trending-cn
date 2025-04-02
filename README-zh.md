# GitHub-Trending 桌面应用

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)](LICENSE)

一个使用 Electron 和 React 构建的跨平台桌面应用程序，用于浏览 GitHub 趋势 (Trending) 仓库，并特别提供了仓库描述的中文翻译功能。

## 主要特性

*   **浏览趋势仓库:** 查看 GitHub 每日、每周、每月的趋势仓库列表。
*   **中文翻译:** 使用 OpenRouter API 自动将英文仓库描述翻译成中文（需要配置 API 密钥）。仍可查看原始英文描述。
*   **详细信息:** 显示仓库名称、作者、描述、编程语言、Star 数、Fork 数以及今日/本周/本月新增 Star 数。
*   **本地缓存:** 获取的数据会缓存在本地，以减少网络请求并提高加载速度。更新间隔可配置。
*   **历史记录:** 单独保存自您开始使用该应用以来在趋势列表中出现过的仓库。
*   **代理支持:** 如有需要，可配置 HTTP/SOCKS 代理以访问 GitHub 和翻译 API。
*   **设置面板:**
    *   配置您的 OpenRouter API 密钥。
    *   设置数据更新间隔（小时）。
    *   设置代理服务器 URL。
    *   选择界面语言（中文/英文）。
    *   清除特定时间段或所有时间段的缓存数据。
*   **跨平台:** 可构建适用于 Windows、macOS 和 Linux 的版本。
*   **外部链接:** 方便地在默认浏览器中打开仓库 URL。

## 应用截图

*(在此处添加应用程序界面截图)*

*   主趋势视图
*   历史记录视图
*   设置弹窗

## 安装 / 从源码运行

1.  **克隆仓库:**
    ```bash
    git clone https://github.com/lisniuse/CodeBundle.git
    cd CodeBundle
    ```
2.  **安装依赖:**
    ```bash
    npm install
    ```
3.  **以开发模式运行:**
    这将启动 Vite 开发服务器和 Electron 应用。
    ```bash
    npm run dev
    ```

## 使用说明

1.  启动应用程序。
2.  **重要:** 前往“设置”（通常是一个图标或菜单项），配置您的 **OpenRouter API 密钥** 以启用描述翻译功能。您可以从 [openrouter.ai](https://openrouter.ai/) 获取密钥。
3.  （可选）在“设置”中配置代理 URL 并调整数据更新间隔。
4.  使用标签页选择所需的时间周期（今日、本周、本月）。
5.  浏览趋势仓库列表。点击仓库标题或 URL 可在浏览器中打开。
6.  在单个仓库条目内使用“Show original” / “查看原文”切换按钮，在翻译后的描述和原文描述之间切换。
7.  切换到“历史记录”标签页，查看过去在趋势列表中出现过的仓库。
8.  使用“刷新”按钮手动获取最新数据（会受缓存间隔限制，除非强制刷新）。
9.  如果需要，可以在“设置”中使用“清空本地列表”按钮清除缓存的趋势列表。

## 配置

可在应用程序内访问设置：

*   **OpenRouter API 密钥:** 翻译描述所必需。请前往 [openrouter.ai](https://openrouter.ai/) 获取。应用通过 OpenRouter 使用 `deepseek/deepseek-r1-distill-llama-70b:free` 模型。
*   **数据更新间隔:** 应用自动检查新趋势数据的频率（默认为 6 小时）。
*   **代理服务器:** 可选。如果需要，请输入您的代理 URL（例如 `http://127.0.0.1:7890` 或 `socks5://127.0.0.1:1080`）。
*   **界面语言:** 选择应用程序界面的语言（中文或英文）。

## 构建应用程序

要为不同平台构建可执行包：

*   **构建 Windows 版:**
    ```bash
    npm run build:win
    ```
*   **构建 macOS 版:**
    ```bash
    npm run build:mac
    ```
*   **构建 Linux 版:**
    ```bash
    npm run build:linux
    ```
*   **构建所有平台版 (Windows, macOS, Linux):**
    ```bash
    npm run build:all
    ```

构建好的软件包将位于 `dist` 目录下。

## 许可证

本项目采用 MIT 许可证授权 - 详情请参阅 [LICENSE](LICENSE) 文件。