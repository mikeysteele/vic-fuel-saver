variable "cloudflare_api_token" {
  description = "Cloudflare API Token with Edit Workers and D1 permissions"
  type        = string
  sensitive   = true
}

variable "cloudflare_account_id" {
  description = "Cloudflare Account ID"
  type        = string
}

variable "vic_fuel_consumer_id" {
  description = "Service Victoria Fuel API Consumer ID Secret"
  type        = string
  sensitive   = true
}

variable "logo_dev_secret_key" {
  description = "Logo.dev API Secret Key"
  type        = string
  sensitive   = true
}
