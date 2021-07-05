const users = [
    {id: 'mifi', name: 'Mifi', email: 'mifi@mail.com', password: '1234'},
  ]
const tweets= ['Hello world', 'how are you, people?']

module.exports= {
    users: users,

    tweets: tweets,

    registerUser: (data)=> {
    const { id, name, email, password } = data
    const exists = users.some(user => user.email === email);
    if(!exists) {
        const user = {
          id,
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
    const { user, password } = data;
    const userVerif= users.find(userVerif => (userVerif.email === user || userVerif.id === user) && userVerif.password === password);
    return userVerif
    },

    addTweet: (data) => {
      const {tweet} = data
      tweets= [...tweets, tweet]
    }

}