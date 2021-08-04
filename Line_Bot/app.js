const dotenv = require('dotenv');
dotenv.config(); 
'use strict';

const line = require('@line/bot-sdk');
const express = require('express');
const querystring = require('querystring');

// create LINE SDK config from env variables
const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET,
};

// create LINE SDK client
const client = new line.Client(config);

// create Express app
// about Express itself: https://expressjs.com/
const app = express();

// register a webhook handler with middleware
// about the middleware, please refer to doc
app.post('/callback', line.middleware(config), (req, res) => {
  Promise
    .all(req.body.events.map(handleEvent))
    .then((result) => res.json(result))
    .catch((err) => {
      console.error(err);
      res.status(500).end();
    });
});

// event handler
function handleEvent(event) {
  if (event.replyToken && event.replyToken.match(/^(.)\1*$/)) {
    return console.log('Test hook recieved: ' + JSON.stringify(event.message));
  }
  console.log(`User ID: ${event.source.userId}`);

  switch (event.type) {
    case 'message':
      const message = event.message;
      switch (message.type) {
        case 'text':
          console.log('event source', event.source)
          return handleText(message, event.replyToken, event.source);
        case 'image':
          return handleImage(message, event.replyToken);
        case 'video':
          return handleVideo(message, event.replyToken);
        case 'audio':
          return handleAudio(message, event.replyToken);
        case 'location':
          return handleLocation(message, event.replyToken, event.source);
        case 'sticker':
          return handleSticker(message, event.replyToken);
        default:
          throw new Error(`Unknown message: ${JSON.stringify(message)}`);
      };

    case 'postback':
      let data = querystring.parse(event.postback.data);
      if (data.action === 'buy' && data.itemid === '123') {
        return client.replyMessage(event.replyToken, [
          {
          type: 'text',
          text: '上傳照片注意事項 \n 1. 準備新郎和新娘的個人照 \n 2. 照片皆須正臉 \n 3. 光線避免太暗或太亮 \n 4.頭髮不能遮到五官'
          },
          {
            type: 'text',
            text: '請先上傳新郎的照片'
          }
        ]);
      }
      return client.replyMessage(event.replyToken, {
        type: 'text',
        text: `Got postback: ${JSON.stringify(data)}`
      });
  }
}
async function handleText(message, replyToken, source) {
  switch (message.text) {
    case '測試1':
        return client.replyMessage(replyToken, [
          {
            type: 'sticker',
            packageId: '1',
            stickerId: '1'
          },
          {
            type: 'image',
            originalContentUrl: 'https://developers.line.biz/media/messaging-api/messages/image-full-04fbba55.png',
            previewImageUrl: 'https://developers.line.biz/media/messaging-api/messages/image-167efb33.png'
          },
          {
            type: 'video',
            originalContentUrl: 'https://www.sample-videos.com/video123/mp4/240/big_buck_bunny_240p_1mb.mp4',
            previewImageUrl: 'https://www.sample-videos.com/img/Sample-jpg-image-50kb.jpg'
          },
          {
            type: 'audio',
            originalContentUrl: 'https://www.sample-videos.com/audio/mp3/crowd-cheering.mp3',
            duration: '27000'
          },
          {
            type: 'location',
            title: 'my location',
            address: '〒150-0002 東京都渋谷区渋谷２丁目２１−１',
            latitude: 35.65910807942215,
            longitude: 139.70372892916203
          }
      ]);

    case 'Buttons template':
        return client.replyMessage(replyToken,
          {
            type: 'template',
            altText: 'This is a buttons template',
            template: {
              type: 'buttons',
              thumbnailImageUrl: 'https://ithelp.ithome.com.tw/images/ironman/11th/event/kv_event/kv-bg-addfly.png',
              imageAspectRatio: 'rectangle',
              imageSize: 'cover',
              imageBackgroundColor: '#FFFFFF',
              title: 'Menu',
              text: 'Please select',
              defaultAction: {
                type: 'uri',
                label: 'View detail',
                uri: 'http://example.com/page/123',
              },
              actions: [
                {
                  type: 'postback',
                  label: 'Buy',
                  data: 'action=buy&itemid=123',
                },
                {
                  type: 'message',
                  label: 'it 邦幫忙鐵人賽',
                  text: 'it 邦幫忙鐵人賽',
                },
                {
                  type: 'uri',
                  label: 'View detail',
                  uri: 'https://ithelp.ithome.com.tw/2020ironman',
                },
              ],
            },
      });

    case 'Confirm template':
        return client.replyMessage(replyToken,
          {
            type: 'template',
            altText: 'this is a confirm template',
            template: {
              type: 'confirm',
              text: 'Are you sure?',
              actions: [
                {
                  type: 'message',
                  label: 'Yes',
                  text: 'yes',
                },
                {
                  type: 'message',
                  label: 'No',
                  text: 'no',
                },
              ],
            },
          });

    case 'Flex template':
      return client.replyMessage(replyToken, {
        type: 'flex',
        altText: 'This is a flex template',
        contents: {
              "type": "bubble",
              "hero": {
                "type": "image",
                "url": "https://ithelp.ithome.com.tw/images/ironman/11th/event/kv_event/kv-bg-addfly.png",
                "size": "full",
                "aspectRatio": "20:13",
                "aspectMode": "cover",
                "action": {
                  "type": "uri",
                  "uri": "http://linecorp.com/"
                },
                "backgroundColor": "#FFFFFF"
              },
              "body": {
                "type": "box",
                "layout": "vertical",
                "contents": [
                  {
                    "type": "text",
                    "text": "Menu",
                    "weight": "bold",
                    "size": "xl",
                    "margin": "md"
                  },
                  {
                    "type": "text",
                    "text": "Please select",
                    "margin": "md"
                  },
                  {
                    "type": "spacer"
                  }
                ],
                "action": {
                  "type": "uri",
                  "label": "View detail",
                  "uri": "http://linecorp.com/",
                  "altUri": {
                    "desktop": "http://example.com/page/123"
                  }
                }
              },
              "footer": {
                "type": "box",
                "layout": "vertical",
                "spacing": "sm",
                "contents": [
                  {
                    "type": "button",
                    "action": {
                      "type": "postback",
                      "label": "製作婚宴照片",
                      "data": "action=buy&itemid=123"
                    },
                    "height": "sm"
                  },
                  {
                    "type": "button",
                    "action": {
                      "type": "message",
                      "label": "我想聊天",
                      "text": "我想聊天"
                    },
                    "height": "sm"
                  },
                  {
                    "type": "button",
                    "action": {
                      "type": "uri",
                      "label": "最新訊息",
                      "uri": "https://www.thelalu.com.tw/zh-tw/Wedding"
                    },
                    "height": "sm"
                  }
                ],
                "flex": 0
              },
              "styles": {
                "footer": {
                  "separator": true
                }
              }
            }
          
          });
    
    case '我想聊天':
      return client.replyMessage(replyToken, {
        type: 'text',
        text: '你好！小樂是剛滿28歲的美女，是土身土長的南投人喔'
      })
  }

  // create a echoing text message
  const echo = { type: 'text', text: event.message.text };

  // use reply API
  return client.replyMessage(event.replyToken, echo);
}

// listen on port
app.listen(3001, () => {
  console.log(`[BOT已準備就緒]`);
});


// Bot所監聽的webhook路徑與port
// app.listen('/linewebhook', 3001, function () {
//     console.log('[BOT已準備就緒]');
// });

//module.exports = app;