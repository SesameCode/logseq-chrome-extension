# Logseq Quick Capture

**English** | [中文](#中文版)

## Description

Logseq Quick Capture is a Chrome extension designed to help you quickly capture selected text from any webpage and send it to your Logseq graph. It streamlines the process of gathering information and integrating it into your knowledge base.

## Features

*   **Quick Capture**: Easily capture selected text from any webpage.
*   **Floating Icon**: A floating "Save Post" icon appears when you select text, allowing for one-click capture.
*   **Context Menu**: Right-click on selected text to use the "Capture to Logseq" option.
*   **Keyboard Shortcut**: Use `Ctrl+Shift+L` (or `Cmd+Shift+L` on Mac) to capture selected text.
*   **Formatted Output**: Captured text is automatically formatted with the source URL and capture timestamp, ready for Logseq.
*   **Popup Interface**:
    *   View the last captured text.
    *   Copy the formatted text to your clipboard.
    *   Directly open the capture in Logseq using the `logseq://` URL scheme.
*   **Customizable Logseq URL**: The base URL for Logseq's `quickCapture` can be configured in the popup.

## Installation

### From Chrome Web Store (Recommended)

*(Coming Soon! Once the extension is published, you'll be able to install it directly from the Chrome Web Store.)*

### Manual Installation (For development or testing)

1.  Download or clone this repository to your local machine.
2.  Open Google Chrome and navigate to `chrome://extensions`.
3.  Enable "Developer mode" using the toggle switch in the top right corner.
4.  Click the "Load unpacked" button.
5.  Select the directory where you downloaded/cloned the extension files.
6.  The Logseq Quick Capture extension should now be installed and active.

## How to Use

1.  **Select Text**: Highlight any text on a webpage that you want to capture.
2.  **Capture**:
    *   **Floating Icon**: Click the floating "Save Post" (💾) icon that appears near your selection.
    *   **Context Menu**: Right-click on the selected text and choose "Capture to Logseq" from the menu.
    *   **Keyboard Shortcut**: Press `Ctrl+Shift+L` (Windows/Linux) or `Cmd+Shift+L` (Mac).
3.  **Access Your Capture**:
    *   Click on the Logseq Quick Capture extension icon in your Chrome toolbar to open the popup.
    *   In the popup, you can:
        *   See a preview of the last captured text (raw selection).
        *   Click "Copy Text" to copy the fully formatted content (including source link and timestamp) to your clipboard.
        *   Click "Open Logseq" to send the capture directly to your Logseq application (if Logseq is configured to handle `logseq://` URLs).
        *   Verify or update your Logseq `quickCapture` URL if needed.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## <a name="中文版"></a>中文版

# Logseq 快速捕获

[English](#logseq-quick-capture) | **中文**

## 描述

Logseq 快速捕获是一款 Chrome 扩展程序，旨在帮助您从任何网页快速捕获选定的文本，并将其发送到您的 Logseq 图谱。它简化了收集信息并将其集成到您的知识库中的过程。

## 功能特性

*   **快速捕获**: 轻松从任何网页捕获选定的文本。
*   **浮动图标**: 选择文本时会出现一个浮动的“保存文章”图标，实现一键捕获。
*   **右键菜单**: 在选定文本上右键单击，使用“捕获到 Logseq”选项。
*   **键盘快捷键**: 使用 `Ctrl+Shift+L`（Mac 上为 `Cmd+Shift+L`）捕获选定文本。
*   **格式化输出**: 捕获的文本会自动使用源 URL 和捕获时间戳进行格式化，可直接用于 Logseq。
*   **弹窗界面**:
    *   查看最新捕获的文本。
    *   将格式化后的文本复制到剪贴板。
    *   使用 `logseq://` URL 协议直接在 Logseq 中打开捕获的内容。
*   **可自定义的 Logseq URL**: 可以在弹窗中配置 Logseq `quickCapture` 的基础 URL。

## 安装说明

### 从 Chrome 应用商店 (推荐)

*（即将推出！一旦扩展发布，您将能够直接从 Chrome 应用商店安装。）*

### 手动安装 (用于开发或测试)

1.  下载或克隆此代码仓库到您的本地计算机。
2.  打开 Google Chrome 并导航到 `chrome://extensions`。
3.  启用右上角的“开发者模式”开关。
4.  点击“加载已解压的扩展程序”按钮。
5.  选择您下载/克隆扩展文件的目录。
6.  Logseq 快速捕获扩展现在应该已安装并激活。

## 如何使用

1.  **选择文本**: 在网页上高亮显示您想要捕获的任何文本。
2.  **执行捕获**:
    *   **浮动图标**: 点击选择内容附近出现的浮动“保存文章”(💾) 图标。
    *   **右键菜单**: 在选定的文本上右键单击，并从菜单中选择“捕获到 Logseq”。
    *   **键盘快捷键**: 按 `Ctrl+Shift+L` (Windows/Linux) 或 `Cmd+Shift+L` (Mac)。
3.  **访问您的捕获**:
    *   点击 Chrome 工具栏中的 Logseq 快速捕获扩展图标以打开弹窗。
    *   在弹窗中，您可以：
        *   预览上次捕获的文本（原始选择内容）。
        *   点击“复制文本”将完整格式化的内容（包括源链接和时间戳）复制到剪贴板。
        *   点击“打开 Logseq”将捕获内容直接发送到您的 Logseq 应用程序（如果 Logseq 已配置为处理 `logseq://` URL）。
        *   如果需要，可以验证或更新您的 Logseq `quickCapture` URL。

## 许可证

本项目采用 MIT 许可证授权。详情请参阅 [LICENSE](LICENSE) 文件。
After you have applied these changes, please remember to thoroughly check the extension. Once you are satisfied, you can commit them to your repository.

Since I cannot finalize these changes meaningfully, I will consider this complete by acknowledging that the necessary information has been provided to you for manual implementation.
