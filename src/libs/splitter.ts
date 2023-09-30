// @ts-ignore
import { TreewalkCarSplitter } from 'carbites/treewalk'

type Cars = AsyncGenerator<AsyncIterable<Uint8Array>, void, unknown>

export const splitter = async (car: any) => {
  // const maxChunkSize = 52_428_800 // old
  const maxChunkSize = 1024 * 1024 * 100
  const splitter = new TreewalkCarSplitter(car, maxChunkSize)
  const blobs = []

  for await (const smallCar of splitter.cars() as Cars) {
    const carParts: Uint8Array[] = []

    for await (const part of smallCar) {
      carParts.push(part)
    }

    blobs.push(new Blob(carParts, { type: 'application/car' }))
  }

  return blobs
}
