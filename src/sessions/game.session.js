import Game from '../classes/model/game.class.js';
import User from '../classes/model/user.class.js';
import CharacterData from '../classes/model/characterData.class.js';
import { plainToInstance } from 'class-transformer';
import { gameSession } from './session.js';
import EventManager from '../classes/manager/event.manager.js';
import IntervalManager from '../classes/manager/interval.manager.js';

// 새 게임 세션 대신 기존 json형태의 게임 객체를 복원하고 넣어주는 역할할
// roomData << raw 객체체
export const addGameSession = (roomData) => {
  let users = [];
  roomData.users.forEach((user) => {
    user.characterData.handCards = new Map(Object.entries(user.characterData.handCards));
    user.characterData = plainToInstance(CharacterData, user.characterData);
    const newUser = plainToInstance(User, user);
    
    // 사용자별 카드 배분
    const gainCards = roomData.deck.splice(0, newUser.characterData.hp);
    for (const card of gainCards) {
      newUser.addHandCard(card);
    }

    users.push(newUser);
  });
  roomData.events = new EventManager(); 
  roomData.intervalManager = new IntervalManager();
  const room = plainToInstance(Game, roomData);
  room.users = users;

  gameSession.push(room);
};

export const removeGameSession = (gameId) => {
  const index = gameSession.findIndex((game) => game.id === gameId);
  // 못 찾은 경우
  if (index === -1) {
    console.error('게임을 찾지 못했습니다.');
    return null;
  }

  const game = gameSession.splice(index, 1)[0];
  if (game) {
    game.release();
  }

  return game;
};

export const findGameById = (gameId) => {
  const index = gameSession.findIndex((game) => game.id === gameId);
  if (index !== -1) {
    return gameSession[index];
  }
};

export const joinGameSession = (gameId, user) => {
  const index = gameSession.findIndex((game) => game.id === gameId);
  // 못 찾은 경우
  if (index === -1) {
    console.error('게임을 찾지 못했습니다.');
    return null;
  }
  gameSession[index].users.push(user);

  return gameSession[index];
};

export const getAllGameSessions = () => {
  return gameSession;
};
