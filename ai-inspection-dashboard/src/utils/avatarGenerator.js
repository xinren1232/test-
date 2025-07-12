/**
 * 头像生成工具
 * 使用 DiceBear 开源库生成随机头像
 */

import { createAvatar } from '@dicebear/core';
import { avataaars, personas, initials, shapes, bottts } from '@dicebear/collection';

// 头像样式配置
const AVATAR_STYLES = {
  user: {
    style: avataaars,
    options: {
      backgroundColor: ['b6e3f4', 'c0aede', 'd1d4f9', 'ffd5dc', 'ffdfbf'],
      accessories: ['wayfarers', 'round', 'prescription01', 'prescription02'],
      accessoriesColor: ['262e33', '65c9ff', 'f8b500', 'ff5722'],
      clothing: ['blazerShirt', 'blazerSweater', 'collarSweater', 'graphicShirt', 'hoodie', 'overall', 'shirtCrewNeck', 'shirtScoopNeck', 'shirtVNeck'],
      clothingColor: ['262e33', '65c9ff', 'f8b500', 'ff5722', '25557c', 'e6e6e6', 'd84315'],
      eyebrows: ['default', 'defaultNatural', 'flatNatural', 'raisedExcited', 'unibrowNatural'],
      eyes: ['default', 'closed', 'cry', 'dizzy', 'eyeRoll', 'happy', 'hearts', 'side', 'squint', 'surprised', 'wink', 'winkWacky'],
      facialHair: ['default', 'beard', 'beardMedium', 'beardLight', 'beardMajestic', 'moustacheFancy', 'moustacheMagnum'],
      facialHairColor: ['724133', 'd6b370', 'f59797', 'c93305', '2c1b18', 'b58143'],
      hairColor: ['724133', 'd6b370', 'f59797', 'c93305', '2c1b18', 'b58143'],
      hatColor: ['262e33', '65c9ff', 'f8b500', 'ff5722', '25557c'],
      mouth: ['default', 'concerned', 'disbelief', 'eating', 'grimace', 'sad', 'screamOpen', 'serious', 'smile', 'tongue', 'twinkle', 'vomit'],
      skin: ['tanned', 'yellow', 'pale', 'light', 'brown', 'darkBrown', 'black'],
      top: ['noHair', 'eyepatch', 'hat', 'hijab', 'turban', 'winterHat1', 'winterHat2', 'winterHat3', 'winterHat4', 'longHairBigHair', 'longHairBob', 'longHairBun', 'longHairCurly', 'longHairCurvy', 'longHairDreads', 'longHairFrida', 'longHairFro', 'longHairFroBand', 'longHairNotTooLong', 'longHairShavedSides', 'longHairMiaWallace', 'longHairStraight', 'longHairStraight2', 'longHairStraightStrand', 'shortHairDreads01', 'shortHairDreads02', 'shortHairFrizzle', 'shortHairShaggyMullet', 'shortHairShortCurly', 'shortHairShortFlat', 'shortHairShortRound', 'shortHairShortWaved', 'shortHairSides', 'shortHairTheCaesar', 'shortHairTheCaesarSidePart']
    }
  },
  assistant: {
    style: bottts,
    options: {
      backgroundColor: ['409eff', '67c23a', 'e6a23c', 'f56c6c', '909399'],
      eyes: ['bulging', 'dizzy', 'eva', 'frame1', 'frame2', 'glow', 'happy', 'hearts', 'robocop', 'round', 'roundFrame01', 'roundFrame02', 'sensor', 'shade01'],
      mouth: ['bite', 'diagram', 'grill01', 'grill02', 'grill03', 'smile01', 'smile02', 'square01', 'square02'],
      texture: ['circuits', 'dots', 'metal01', 'metal02', 'rusty01', 'rusty02', 'rusty03', 'rusty04', 'rusty05'],
      top: ['antenna', 'bulb01', 'bulb02', 'glowstick', 'glowstick02', 'lights', 'radar', 'satellite']
    }
  },
  simple: {
    style: initials,
    options: {
      backgroundColor: ['409eff', '67c23a', 'e6a23c', 'f56c6c', '909399', 'ff7875', '40a9ff', '36cfc9', '73d13d', 'ffc53d'],
      fontSize: 50,
      fontWeight: 600,
      textColor: ['ffffff']
    }
  }
};

/**
 * 生成随机头像
 * @param {string} type - 头像类型 ('user' | 'assistant' | 'simple')
 * @param {string} seed - 种子字符串，相同种子生成相同头像
 * @param {number} size - 头像尺寸
 * @returns {string} SVG 字符串
 */
export function generateAvatar(type = 'user', seed = null, size = 64) {
  // 如果没有提供种子，生成随机种子
  if (!seed) {
    seed = Math.random().toString(36).substring(2, 15);
  }

  const config = AVATAR_STYLES[type] || AVATAR_STYLES.user;
  
  const avatar = createAvatar(config.style, {
    seed,
    size,
    ...config.options
  });

  return avatar.toString();
}

/**
 * 生成头像数据URL
 * @param {string} type - 头像类型
 * @param {string} seed - 种子字符串
 * @param {number} size - 头像尺寸
 * @returns {string} Data URL
 */
export function generateAvatarDataUrl(type = 'user', seed = null, size = 64) {
  const svgString = generateAvatar(type, seed, size);
  const base64 = btoa(unescape(encodeURIComponent(svgString)));
  return `data:image/svg+xml;base64,${base64}`;
}

/**
 * 为用户生成随机头像
 * @param {string} username - 用户名（可选）
 * @param {number} size - 头像尺寸
 * @returns {string} Data URL
 */
export function generateUserAvatar(username = null, size = 64) {
  const seed = username || `user_${Date.now()}_${Math.random()}`;
  return generateAvatarDataUrl('user', seed, size);
}

/**
 * 为助手生成随机头像
 * @param {string} assistantId - 助手ID（可选）
 * @param {number} size - 头像尺寸
 * @returns {string} Data URL
 */
export function generateAssistantAvatar(assistantId = null, size = 64) {
  const seed = assistantId || `assistant_${Date.now()}_${Math.random()}`;
  return generateAvatarDataUrl('assistant', seed, size);
}

/**
 * 生成简单字母头像
 * @param {string} text - 显示的文字
 * @param {number} size - 头像尺寸
 * @returns {string} Data URL
 */
export function generateInitialsAvatar(text = 'AI', size = 64) {
  const seed = text.toUpperCase().substring(0, 2);
  return generateAvatarDataUrl('simple', seed, size);
}

/**
 * 缓存头像到 localStorage
 * @param {string} key - 缓存键
 * @param {string} avatarUrl - 头像URL
 */
export function cacheAvatar(key, avatarUrl) {
  try {
    localStorage.setItem(`avatar_${key}`, avatarUrl);
  } catch (error) {
    console.warn('Failed to cache avatar:', error);
  }
}

/**
 * 从 localStorage 获取缓存的头像
 * @param {string} key - 缓存键
 * @returns {string|null} 头像URL或null
 */
export function getCachedAvatar(key) {
  try {
    return localStorage.getItem(`avatar_${key}`);
  } catch (error) {
    console.warn('Failed to get cached avatar:', error);
    return null;
  }
}

/**
 * 获取或生成用户头像（带缓存）
 * @param {string} userId - 用户ID
 * @param {number} size - 头像尺寸
 * @returns {string} 头像URL
 */
export function getOrGenerateUserAvatar(userId = 'default_user', size = 64) {
  const cacheKey = `user_${userId}_${size}`;
  let avatar = getCachedAvatar(cacheKey);
  
  if (!avatar) {
    avatar = generateUserAvatar(userId, size);
    cacheAvatar(cacheKey, avatar);
  }
  
  return avatar;
}

/**
 * 获取或生成助手头像（带缓存）
 * @param {string} assistantId - 助手ID
 * @param {number} size - 头像尺寸
 * @returns {string} 头像URL
 */
export function getOrGenerateAssistantAvatar(assistantId = 'iqe_assistant', size = 64) {
  const cacheKey = `assistant_${assistantId}_${size}`;
  let avatar = getCachedAvatar(cacheKey);
  
  if (!avatar) {
    avatar = generateAssistantAvatar(assistantId, size);
    cacheAvatar(cacheKey, avatar);
  }
  
  return avatar;
}
