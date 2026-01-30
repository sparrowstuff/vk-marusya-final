module.exports = {
  publicPath:
    process.env.NODE_ENV === 'production'
      ? '/vk-marusya-final/' // Обратите внимание на слеши
      : '/',
}
