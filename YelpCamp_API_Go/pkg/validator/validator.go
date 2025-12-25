package validator

import (
	"github.com/go-playground/validator/v10"
)

var validate *validator.Validate

func init() {
	validate = validator.New()
}

func Validate(s interface{}) error {
	return validate.Struct(s)
}

func ValidationErrors(err error) []string {
	var errors []string
	if validationErrors, ok := err.(validator.ValidationErrors); ok {
		for _, e := range validationErrors {
			errors = append(errors, formatError(e))
		}
	}
	return errors
}

func formatError(e validator.FieldError) string {
	switch e.Tag() {
	case "required":
		return e.Field() + " is required"
	case "email":
		return e.Field() + " must be a valid email"
	case "min":
		return e.Field() + " must be at least " + e.Param() + " characters"
	case "max":
		return e.Field() + " must be at most " + e.Param() + " characters"
	case "url":
		return e.Field() + " must be a valid URL"
	case "alphanum":
		return e.Field() + " must contain only alphanumeric characters"
	default:
		return e.Field() + " is invalid"
	}
}
