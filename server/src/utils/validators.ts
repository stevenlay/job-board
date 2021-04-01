interface AuthErrors {
  field?: string;
  message?: string;
}

export const registerValidator = (username: string, password: string) => {
  const errors: AuthErrors = {};

  if (
    !username ||
    username.trim() === '' ||
    username.length > 20 ||
    username.length < 3
  ) {
    errors.field = 'username';
    errors.message = 'Username must be in range of 3-20 characters length.';
  }

  if (!/^[a-zA-Z0-9-_]*$/.test(username)) {
    errors.field = 'username';
    errors.message = 'Username must have alphanumeric characters only.';
  }

  if (!password || password.length < 6) {
    errors.field = 'password';
    errors.message = 'Password must be atleast 6 characters long.';
  }

  return {
    errors,
    valid: Object.keys(errors).length === 0,
  };
};

export const loginValidator = (username: string, password: string) => {
  const errors: AuthErrors = {};

  if (!username || username.trim() === '') {
    errors.field = 'username';
    errors.message = 'Username field must not be empty.';
  }

  if (!password) {
    errors.field = password;
    errors.message = 'Password field must not be empty.';
  }

  return {
    errors,
    valid: Object.keys(errors).length == 0,
  };
};
