terraform {
  required_version = ">= 1.0"
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.50"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.5"
    }
  }
}

provider "azurerm" {
  features {}
  
  subscription_id = var.azure_subscription_id
  tenant_id       = var.azure_tenant_id
  client_id       = var.azure_client_id
  client_secret   = var.azure_client_secret
}

resource "azurerm_resource_group" "workato_rg" {
  name     = "rg-${var.project_name}-${var.environment}"
  location = var.azure_location
  tags = {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "Terraform"
    CreatedAt   = timestamp()
  }
}

resource "azurerm_key_vault" "workato_kv" {
  name                        = "kv-${var.project_name}-${var.environment}-${random_string.kv_suffix.result}"
  location                    = azurerm_resource_group.workato_rg.location
  resource_group_name         = azurerm_resource_group.workato_rg.name
  enabled_for_disk_encryption = true
  tenant_id                   = var.azure_tenant_id
  sku_name                    = "standard"

  tags = azurerm_resource_group.workato_rg.tags
}

resource "azurerm_mssql_server" "workato_sql" {
  name                         = "sql-${var.project_name}-${var.environment}-${random_string.sql_suffix.result}"
  resource_group_name          = azurerm_resource_group.workato_rg.name
  location                     = azurerm_resource_group.workato_rg.location
  version                      = "12.0"
  administrator_login          = var.sql_admin_username
  administrator_login_password = random_password.sql_password.result

  tags = azurerm_resource_group.workato_rg.tags
}

resource "azurerm_mssql_database" "workato_db" {
  name           = "${var.project_name}_${var.environment}"
  server_id      = azurerm_mssql_server.workato_sql.id
  collation      = "SQL_Latin1_General_CP1_CI_AS"
  sku_name       = var.environment == "prod" ? "S2" : "S1"
  max_size_gb    = var.environment == "prod" ? 50 : 20

  tags = azurerm_resource_group.workato_rg.tags
}

resource "azurerm_mssql_firewall_rule" "workato_ip" {
  name             = "Allow-Workato"
  server_id        = azurerm_mssql_server.workato_sql.id
  start_ip_address = var.workato_ip_start
  end_ip_address   = var.workato_ip_end
}

resource "azurerm_key_vault_secret" "sql_password" {
  name            = "${var.project_name}-sql-password"
  value           = random_password.sql_password.result
  key_vault_id    = azurerm_key_vault.workato_kv.id
  content_type    = "password"

  tags = azurerm_resource_group.workato_rg.tags
}

resource "azurerm_storage_account" "workato_storage" {
  name                     = "${replace(var.project_name, "-", "")}${replace(var.environment, "-", "")}${random_string.storage_suffix.result}"
  resource_group_name      = azurerm_resource_group.workato_rg.name
  location                 = azurerm_resource_group.workato_rg.location
  account_tier             = "Standard"
  account_replication_type = "LRS"

  tags = azurerm_resource_group.workato_rg.tags
}

resource "random_password" "sql_password" {
  length      = 32
  special     = true
  override_special = "!@#$%&"
}

resource "random_string" "kv_suffix" {
  length  = 4
  special = false
  upper   = false
}

resource "random_string" "sql_suffix" {
  length  = 4
  special = false
  upper   = false
}

resource "random_string" "storage_suffix" {
  length  = 4
  special = false
  upper   = false
}
