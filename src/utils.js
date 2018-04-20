export default class Utils {
  /**
   * 生成一组不重复的随机整数
   * @param {number} groupNum 生成随机数的数量
   * @param {number} min 随机数的最小值
   * @param {number} max 随机数的最大值
   */
  static generateRandomNumGroup(groupNum, min, max) {
    if (max < min) {
      console.error("Utils.generateRandomNumGroup: 最小值不应大于最大值！");
      return null;
    }

    // 把最小到最大区间的整数全部放入数组中
    const allNumbers = [];
    for (let i = min; i <= max; i++) {
      allNumbers.push(i);
    }

    if (groupNum > allNumbers.length) {
      console.error(
        "Utils.generateRandomNumGroup: 随机数个数不应大于区间内整数个数"
      );
      return null;
    }

    const randomGroup = [];
    for (let i = 0; i < groupNum; i++) {
      // 随机生成下标
      const randomPos = parseInt(Math.random() * allNumbers.length, 10);
      // 将该下标对应的数字放入组中
      randomGroup.push(allNumbers[randomPos]);

      // 将最后一个数放在已被抽走的位置
      allNumbers[randomPos] = allNumbers[allNumbers.length - 1];
      // 将最后一位去除
      allNumbers.pop();
    }

    return randomGroup;
  }
}
