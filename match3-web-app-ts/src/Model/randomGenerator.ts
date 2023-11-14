import {Generator} from "./board";

export class RandomGenerator implements Generator<string> {
    private images: string[] = [
        'bmw.png',
        'mercedes.png',
        'mazda.png',
        'peugeot.png',
        'renault.png',
        'toyota.png',
    ]

    private static instance: RandomGenerator;
    private constructor() { }
    public static getInstance(): RandomGenerator {
        if (!RandomGenerator.instance) {
            RandomGenerator.instance = new RandomGenerator();
        }
        return RandomGenerator.instance;
    }
    public generateRandomNumber(max: number): number {
        return Math.floor(Math.random() * max);
    }

    next() {
        return this.images[this.generateRandomNumber(this.images.length)];
    }

}