const common = {
  sleep: ms => new Promise((resolve, reject) => setTimeout(resolve, ms)),
  sum: arr => {
    return arr.reduce((prev, current) => {
      return prev + current;
    });
  },
  average: arr => {
    return common.sum(arr) / arr.length;
  },
  median: arr => {
    const halfIndex = (arr.length / 2) | 0;
    const sortedArr = arr.sort();

    if (sortedArr % 2) {
      return sortedArr[halfIndex];
    }

    return (sortedArr[halfIndex - 1] + sortedArr[halfIndex]) / 2;
  }
};
