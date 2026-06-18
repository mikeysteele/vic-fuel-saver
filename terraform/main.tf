terraform {
  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 4.0"
    }
  }
}

provider "cloudflare" {
  api_token = trimspace(var.cloudflare_api_token)
}

# Provisioning the D1 Database
resource "cloudflare_d1_database" "fuel_saver_db" {
  account_id = var.cloudflare_account_id
  name       = "vic-fuel-saver-db"
}

# Sync GitHub Secrets as Encrypted Cloudflare Worker Secrets
resource "cloudflare_workers_secret" "vic_fuel_consumer_id" {
  account_id  = var.cloudflare_account_id
  name        = "VIC_FUEL_CONSUMER_ID"
  script_name = "vic-fuel-saver"
  secret_text = var.vic_fuel_consumer_id
}

resource "cloudflare_workers_secret" "logo_dev_secret_key" {
  account_id  = var.cloudflare_account_id
  name        = "LOGO_DEV_SECRET_KEY"
  script_name = "vic-fuel-saver"
  secret_text = var.logo_dev_secret_key
}
