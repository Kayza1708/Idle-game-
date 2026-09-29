import {describe,expect,it} from 'vitest';
import {newGame} from './economy';
import {addFindCard,componentFind} from './RewardFeedback';
it('describes only booked component deltas and caps merged feedback at three cards',()=>{const before=newGame(0),after={...before,componentInventory:{...before.componentInventory,circuits:2,graphene:1},components:3},card=componentFind(before,after,'world-drop',100)!;expect(card.items).toEqual({circuits:2,graphene:1});let cards=[card];cards=addFindCard(cards,{...card,id:'b',createdAt:500,items:{circuits:3}});expect(cards).toHaveLength(1);expect(cards[0].items.circuits).toBe(5);for(let i=0;i<4;i++)cards=addFindCard(cards,{id:String(i),source:String(i),createdAt:2000+i,items:{circuits:1}});expect(cards).toHaveLength(3)});
