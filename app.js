const users = [
    {id: 1, name: 'Mifi', email: 'mifi@mail.com', password: '1234'},
  ]
const tweets= ['Hello world', 'how are you, people?']

module.exports= {
    users: users,

    tweets: tweets,

    registerUser: (data)=> {
    const { name, email, password } = data
    const exists = users.some(user => user.email === email);
    if(!exists) {
        const user = {
          id: users.length + 1,
          name,
          email,
          password
        };
        users.push(user);
        return true;
      }
      return false;
    },

    verifyUser: (data) => {
    const { email, password } = data;
    const user= users.find(user => user.email === email && user.password === password);
    return user
    },

    addTweet: (tweet) => {tweets.push(tweet)}

}