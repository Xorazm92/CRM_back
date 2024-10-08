function generateUsers(count) {
  const users = [];
  for (let i = 0; i < count; i++) {
    const email = `user${i + 1}@example.com`;
    const name = `User ${i + 1}`;
    const password = `password${i + 1}`;
    users.push({ email, name, password });
  }
  return users;
}

console.log(JSON.stringify(generateUsers(50)))
