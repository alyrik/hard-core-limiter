import messageService, { IMessage, MessageType } from '../../services/messageService';
import { ILimitedList } from '../../models';
import storageService from '../../services/storageService';

const baseClassName = '__hard-core-limiter';
const classes = {
  counter: `${baseClassName}__counter`,
  counterDanger: `${baseClassName}__counter--danger`,
  disabledList: `${baseClassName}__list--disabled`,
};
const selectors = {
  container: '#content',
  listContainer: '.list',
  listHeader: '.list-header-name-assist',
  card: 'a.list-card',
  cardComposer: '.open-card-composer',
  __counter: `.${classes.counter}`,
};

let mutationObserver: MutationObserver;

function setLimit(list: ILimitedList) {
  mutationObserver?.disconnect();

  Array.from(document.querySelectorAll(selectors.listContainer)).forEach(($list) => {
    const $counter = $list.querySelector(selectors.__counter);
    $counter?.parentElement?.removeChild($counter);
  });

  const $listHeader = Array.from(document.querySelectorAll(selectors.listHeader)).find(($header) =>
    $header?.textContent?.includes(list.name!),
  );

  if (!$listHeader || !list) return;

  const handleMutation: MutationCallback = (mutationList) => {
    const hasCardChanges = mutationList.some(
      ({ addedNodes, removedNodes }) => addedNodes.length || removedNodes.length,
    );

    if (hasCardChanges) {
      setLimit(list);
    }
  };

  mutationObserver = new MutationObserver(handleMutation);

  const $listContainer = $listHeader.closest(selectors.listContainer)!;
  const cardCount = $listContainer.querySelectorAll(selectors.card).length;
  const counterText = `${cardCount}/${list.limit}`;
  const $cardComposer = $listContainer.querySelector(selectors.cardComposer)!;
  const $counter = document.createElement('span');
  const isLimitReached = cardCount >= list.limit;

  $counter.classList.add(
    ...[classes.counter, isLimitReached ? classes.counterDanger : ''].filter(Boolean),
  );
  $counter.textContent = counterText;
  $cardComposer.appendChild($counter);
  $listContainer.classList.toggle(classes.disabledList, isLimitReached);

  mutationObserver.observe($listContainer, { childList: true, subtree: true });
}

async function init() {
  const $lists = document.querySelectorAll('.js-list-name-assist');
  const listNames = Array.from($lists).map(($list) => $list.textContent);
  const limitedList = await storageService.getItem<ILimitedList>('limitedList');

  if (limitedList) {
    setLimit(limitedList);
  }

  messageService.sendToRuntime({ type: MessageType.SetLists, data: listNames });
  messageService.subscribe(MessageType.SetLimit, (event: IMessage<ILimitedList>) =>
    setLimit(event.data!),
  );
}

const checkReady = setInterval(() => {
  if (document.readyState === 'complete') {
    clearInterval(checkReady);

    setTimeout(() => {
      const $container = document.querySelector(selectors.container);

      if ($container) {
        init();
      } else {
        console.log('No container');
      }
    }, 1000);
  }
}, 500);
