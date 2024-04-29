function calcualateNumberOfSocksWithCompletePair(
  numberOfSocks: number,
  arrayOfSocksInThePile: number[],
): number {
  const socksInthePileMap = new Map<number, number>();

  let numberOfCompletePairs = 0;

  for (let i = 0; i < arrayOfSocksInThePile.length; i++) {
    const currentSock: number = arrayOfSocksInThePile[i];

    //check if we have seen an unrecorded sock in the map before
    const numberOfSockFoundPerColor: number | undefined =
      socksInthePileMap.get(currentSock);

    //if we have not seen an unrecored sock,
    //we want to record this sock in the map, and move to the next sock
    if (!numberOfSockFoundPerColor) {
      socksInthePileMap.set(currentSock, 1);
      continue;
    }

    //if we've seen the sock before, we now have the
    // complete 2 pair of the sock of this color, so we increase the sock count
    //and delete this map entry,
    //so the next sock of the same color can be recorded and its pair found or not found
    numberOfCompletePairs += 1;
    socksInthePileMap.delete(currentSock);
  }

  return numberOfCompletePairs;
}

console.log(
  calcualateNumberOfSocksWithCompletePair(
    3,
    [10, 20, 20, 10, 10, 30, 50, 10, 20],
  ),
);


