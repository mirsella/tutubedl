module.exports = {
  extends: [
    'plugin:vue/vue3-essential',
  ],
  rules: {
   "vue/no-unused-vars": ["error", {
        "ignorePattern": "^_"
    }]
  }
}
