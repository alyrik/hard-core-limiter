export enum MessageType {
  SetLimit,
  SetLists,
}

export interface IMessage<TData = undefined> {
  type: MessageType;
  data?: TData;
}

class MessageService {
  async sendToContent(message: IMessage) {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.tabs.sendMessage(tab.id!, message);
  }

  sendToRuntime<TData>(message: IMessage<TData>) {
    chrome.runtime.sendMessage(message);
  }

  subscribe<TData = {}>(messageType: MessageType, handler: (message: IMessage<TData>) => void) {
    chrome.runtime.onMessage.addListener((message) => {
      if (message.type === messageType) {
        handler(message);
      }
    });
  }
}

export default new MessageService();
