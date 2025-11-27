import { SocialPlatform } from "../types";

interface WebhookMessage {
  title: string;
  text: string;
  url: string;
}

export const sendToWebhook = async (
  platform: SocialPlatform, 
  webhookUrl: string, 
  message: WebhookMessage
): Promise<boolean> => {
  if (!webhookUrl) return false;

  let body: any = {};
  const { title, text, url } = message;
  
  // Format the message body based on the platform
  switch (platform) {
    case SocialPlatform.DINGTALK:
      // DingTalk Markdown format
      body = {
        msgtype: "markdown",
        markdown: {
          title: title,
          text: `### ${title}\n\n${text}\n\n> [🔊 Click to Listen](${url})`
        }
      };
      break;

    case SocialPlatform.WECHAT:
      // Enterprise WeChat Markdown format
      body = {
        msgtype: "markdown",
        markdown: {
          content: `### ${title}\n${text}\n\n[🔊 Click to Listen](${url})`
        }
      };
      break;

    case SocialPlatform.LARK:
      // Lark/Feishu Interactive Card format
      // Note: Lark webhooks usually look like https://open.feishu.cn/open-apis/bot/v2/hook/...
      body = {
        msg_type: "interactive",
        card: {
          header: {
            title: {
              tag: "plain_text",
              content: title
            },
            template: "blue"
          },
          elements: [
            {
              tag: "div",
              text: {
                tag: "lark_md",
                content: text
              }
            },
            {
              tag: "action",
              actions: [
                {
                  tag: "button",
                  text: {
                    tag: "plain_text",
                    content: "🔊 Listen to Audio"
                  },
                  type: "primary",
                  url: url
                }
              ]
            }
          ]
        }
      };
      break;
      
    default:
      return false;
  }

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    const result = await response.json();
    
    // Check for platform specific error codes
    // Lark: code 0
    // DingTalk: errcode 0
    // WeChat: errcode 0
    if (result.code === 0 || result.errcode === 0) {
      return true;
    } else {
      console.error(`${platform} Webhook Error:`, result);
      return false;
    }
  } catch (error) {
    console.error(`Failed to send to ${platform}:`, error);
    return false;
  }
};