function TweetBox ({ text, username }) {
  return (
    <div>
      <h3>{username ? `${username}:` : ""} {text} </h3>
    </div>
  );
}

export default TweetBox;
