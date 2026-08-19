export default defineAppConfig({
  ui: {
    colors: {
      primary: 'orange',
      neutral: 'stone',
    },
    button: {
      slots: {
        base: 'rounded-full',
      },
    },
    input: {
      slots: {
        base: 'rounded-xl',
      },
    },
    select: {
      slots: {
        base: 'rounded-xl',
        content: 'rounded-xl',
      },
    },
  },
})
