module.exports = {
  info: function() {
    if (process.env.NODE_ENV !== 'test') {
      console.log.apply(console, Array.prototype.slice.call(arguments));
    }
  },

  error: function() {
    if (process.env.NODE_ENV !== 'test') {
      console.error.apply(console, Array.prototype.slice.call(arguments));
    }
  }
};
