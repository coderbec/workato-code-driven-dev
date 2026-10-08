output "resource_group_name" {
  value = azurerm_resource_group.workato_rg.name
}

output "key_vault_name" {
  value = azurerm_key_vault.workato_kv.name
}

output "key_vault_id" {
  value = azurerm_key_vault.workato_kv.id
}

output "sql_server_fqdn" {
  value = azurerm_mssql_server.workato_sql.fully_qualified_domain_name
}

output "sql_database_name" {
  value = azurerm_mssql_database.workato_db.name
}

output "storage_account_name" {
  value = azurerm_storage_account.workato_storage.name
}

output "storage_account_primary_blob_endpoint" {
  value = azurerm_storage_account.workato_storage.primary_blob_endpoint
}
