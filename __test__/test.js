import {describe, expect, test} from '@jest/globals'
import { generateTheme } from '../src'

describe('get theme', ()=>{
    test('the number of themes color is k', ()=>{
        expect(generateTheme('https://c-ssl.duitang.com/uploads/item/202007/04/20200704140220_sdjxd.jpg',6).length).toBe(6);
    })
})