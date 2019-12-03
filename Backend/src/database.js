const users = [{
  id: 1,
  name: 'Alice',
  password: '123456'
},
{
  id: 2,
  name: 'Bob',
  password: '123456'
},
{
  id: 3,
  name: 'Eve',
  password: '123456'
},
{
  id: 4,
  name: 'Mallory',
  password: '123456'
},
{
  id: 5,
  name: 'Trent',
  password: '123456'
}];

const listItems = [
    {
        id: 1,
        message: "Foo",
        isDone: false,
        createdAt: "1573774200000",
        assignee: users[0]
      },
      {
        id: 2,
        message: "Bar",
        isDone: true,
        createdAt: "1573777800000",
        assignee: users[1]
      },
      {
        id: 3,
        message: "Baz",
        isDone: false,
        createdAt: "1573781400000",
        assignee: users[2]
      },
      {
        id: 4,
        message: "Bar",
        isDone: false,
        createdAt: "1573788600000",
        assignee: users[3]
      },
      {
        id: 5,
        message: "Bar",
        isDone: true,
        createdAt: "1573792200000",
        assignee: users[3]
      },
      {
        id: 6,
        message: "Foo",
        isDone: false,
        createdAt: "1573795800000",
        assignee: null
      },
      {
        id: 7,
        message: "Baz",
        isDone: true,
        createdAt: "1573799400000",
        assignee: users[Math.floor(Math.random() * users.length)]
      },
      {
        id: 8,
        message: "Bar",
        isDone: true,
        createdAt: "1573803000000",
        assignee: users[Math.floor(Math.random() * users.length)]
      },
      {
        id: 9,
        message: "Bar",
        isDone: false,
        createdAt: "1573806600000",
        assignee: null
      },
      {
        id: 10,
        message: "Baz",
        isDone: false,
        createdAt: "1573810200000",
        assignee: users[Math.floor(Math.random() * users.length)]
      },
      {
        id: 11,
        message: "Baz",
        isDone: true,
        createdAt: "1573813800000",
        assignee: users[Math.floor(Math.random() * users.length)]
      },
      {
        id: 12,
        message: "Baz",
        isDone: false,
        createdAt: "1573817400000",
        assignee: users[Math.floor(Math.random() * users.length)]
      },
      {
        id: 13,
        message: "Bar",
        isDone: true,
        createdAt: "1573821000000",
        assignee: users[Math.floor(Math.random() * users.length)]
      },
      {
        id: 14,
        message: "Baz",
        isDone: false,
        createdAt: "1573824600000",
        assignee: users[Math.floor(Math.random() * users.length)]
      },
      {
        id: 15,
        message: "Baz",
        isDone: true,
        createdAt: "1573828200000",
        assignee: users[Math.floor(Math.random() * users.length)]
      },
      {
        id: 16,
        message: "Bar",
        isDone: true,
        createdAt: "1573831800000",
        assignee: users[Math.floor(Math.random() * users.length)]
      },
      {
        id: 17,
        message: "Baz",
        isDone: false,
        createdAt: "1573835400000",
        assignee: users[Math.floor(Math.random() * users.length)]
      },
      {
        id: 18,
        message: "Foo",
        isDone: true,
        createdAt: "1573839000000",
        assignee: users[Math.floor(Math.random() * users.length)]
      },
      {
        id: 19,
        message: "Foo",
        isDone: true,
        createdAt: "1573842600000",
        assignee: users[Math.floor(Math.random() * users.length)]
      },
      {
        id: 20,
        message: "Foo",
        isDone: true,
        createdAt: "1573846200000",
        assignee: users[Math.floor(Math.random() * users.length)]
      }];

module.exports =  { listItems, users };