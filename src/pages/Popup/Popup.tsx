import React, { FormEvent, useEffect, useState } from 'react';
import './Popup.css';
import messageService, { MessageType } from '../../services/messageService';
import storageService, { IStorageStructure } from '../../services/storageService';

const Popup = () => {
  const [name, setName] = useState('');
  const [limit, setLimit] = useState('');
  const [boards, setBoards] = useState<string[]>([]);

  useEffect(() => {
    (async function () {
      const boardsList = await storageService.getItem<IStorageStructure['lists']>('lists');
      const limitedBoard = await storageService.getItem<IStorageStructure['limitedList']>(
        'limitedList',
      );
      setBoards(boardsList ?? []);

      if (limitedBoard) {
        setName(limitedBoard.name);
        setLimit(String(limitedBoard.limit));
      }
    })();
  }, []);

  function bindHandleInputChange(setState: (value: string) => void) {
    return (e: FormEvent<HTMLInputElement>) => setState(e.currentTarget.value);
  }

  function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    messageService.sendToRuntime({
      type: MessageType.SetLimit,
      data: { name, limit: Number(limit) },
    });
    setTimeout(() => {
      window.close();
    }, 500);
  }

  return (
    <div className="App">
      <h2>Set limit for a board</h2>
      <form onSubmit={handleSubmit}>
        <label>
          <div>Enter board name</div>
          <div>
            <select name="board" value={name} onChange={(e) => setName(e.currentTarget.value)}>
              {boards.map((boardName) => (
                <option key={boardName} value={boardName}>
                  {boardName}
                </option>
              ))}
            </select>
          </div>
        </label>
        <br />
        <label>
          <div>Enter limit (number of cards)</div>
          <div>
            <input
              type="text"
              name="limit"
              onChange={bindHandleInputChange(setLimit)}
              value={limit}
            />
          </div>
        </label>
        <br />
        <div>
          <button type="submit">Set limit</button>
        </div>
      </form>
    </div>
  );
};

export default Popup;
