import messageService, { IMessage, MessageType } from '../../services/messageService';
import storageService from '../../services/storageService';

async function handleSetLists(event: IMessage) {
  try {
    await storageService.setItem('lists', event.data);
    return true;
  } catch (e) {
    console.log('Failed to set item', e);
  }
}

async function handleSetLimit(event: IMessage) {
  await storageService.setItem('limitedList', event.data);
  messageService.sendToContent(event);
}

chrome.runtime.onMessage.addListener((request) => {
  switch (request.type) {
    case MessageType.SetLists:
      return handleSetLists(request);
    case MessageType.SetLimit:
      return handleSetLimit(request);
  }

  return true;
});
