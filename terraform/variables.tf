variable "project_name" {
  description = "Project name"
  type        = string
  default     = "workato-cdd"
}

variable "environment" {
  description = "Environment (dev, staging, prod)"
  type        = string
  default     = "dev"
  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Environment must be dev, staging, or prod."
  }
}

variable "azure_location" {
  description = "Azure region"
  type        = string
  default     = "eastus"
}

variable "azure_subscription_id" {
  description = "Azure subscription ID"
  type        = string
  sensitive   = true
}

variable "azure_tenant_id" {
  description = "Azure tenant ID"
  type        = string
  sensitive   = true
}

variable "azure_client_id" {
  description = "Azure service principal client ID"
  type        = string
  sensitive   = true
}

variable "azure_client_secret" {
  description = "Azure service principal client secret"
  type        = string
  sensitive   = true
}

variable "sql_admin_username" {
  description = "SQL Server admin username"
  type        = string
  default     = "sqladmin"
}

variable "workato_ip_start" {
  description = "Workato IP range start (for firewall)"
  type        = string
  default     = "1.2.3.4"  # TODO: Update with actual Workato IP range
}

variable "workato_ip_end" {
  description = "Workato IP range end (for firewall)"
  type        = string
  default     = "1.2.3.10"  # TODO: Update with actual Workato IP range
}
