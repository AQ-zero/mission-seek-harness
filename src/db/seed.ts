import { db } from './index';
import { person, value, goal, skill } from './schema';

function main() {
  const people = db.select().from(person).all();
  if (people.length === 0) {
    db.insert(person).values({ name: 'Alvin', bio: '立志成为顶级一人公司 CEO' }).run();
  }
  const values = db.select().from(value).all();
  if (values.length === 0) {
    db.insert(value).values({ statement: '第一性原理：一切从问题本质出发', confidence: 80 }).run();
    db.insert(goal).values({ title: '成为顶级一人公司 CEO', type: 'outcome' }).run();
    db.insert(skill).values({ name: 'decision-making', category: 'soft', level: 1 }).run();
    console.log('已写入最小示例本体');
  } else {
    console.log('已有数据，跳过示例');
  }
}

main();
