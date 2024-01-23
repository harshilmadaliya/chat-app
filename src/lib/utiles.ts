
import { ClassValue , clsx } from "clsx";
import {twMerge} from 'tailwind-merge'


// when use condinitiones classnames we use so that this function is use
// and twMerge is use to Mearge tailwind classes  and is also faster
export function cn(...inputs:ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function chatHrefConstructor (id1:string , id2:string){
    const sortedIds = [id1 , id2].sort()
    return `${sortedIds[0]}--${sortedIds[1]}`
}

export function toPusherKey(key : string) {
 return key.replace(/:/g , '__')
}