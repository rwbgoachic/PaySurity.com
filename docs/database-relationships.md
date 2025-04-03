# Database Relationships in BistroBeast POS System

This document outlines the relationships between various tables in the BistroBeast POS system.

## Core Relationships

### Locations and Merchants
- `posLocations` belong to `merchantProfiles` through `locationId -> merchantProfiles.id`

### Categories
- `posCategories` belong to `posLocations` through `locationId -> posLocations.id`
- Categories can be used for both inventory items and menu items

### Inventory Items
- `posInventoryItems` belong to `posLocations` through `locationId -> posLocations.id`
- `posInventoryItems` belong to `posCategories` through `categoryId -> posCategories.id`
- `posInventoryItems` may belong to `posVendors` through `vendorId -> posVendors.id`

### Menu Items
- `posMenuItems` belong to `posLocations` through `locationId -> posLocations.id`
- `posMenuItems` belong to `posCategories` through `categoryId -> posCategories.id`
- Menu items are linked to inventory items through the `posRecipeItems` junction table

### Recipe Items (Junction Table)
- `posRecipeItems` link `posMenuItems` and `posInventoryItems` 
- `posRecipeItems.menuItemId -> posMenuItems.id`
- `posRecipeItems.inventoryItemId -> posInventoryItems.id`

### Modifiers and Options
- `posModifiers` belong to `posLocations` through `locationId -> posLocations.id`
- `posModifierOptions` belong to `posModifiers` through `modifierId -> posModifiers.id`
- Modifiers are linked to menu items through the `posMenuItemModifiers` junction table

### Menu Item Modifiers (Junction Table)
- `posMenuItemModifiers` link `posMenuItems` and `posModifiers`
- `posMenuItemModifiers.menuItemId -> posMenuItems.id`
- `posMenuItemModifiers.modifierId -> posModifiers.id`

### Tables and Areas
- `posTables` belong to `posLocations` through `locationId -> posLocations.id`
- `posTables` belong to `posAreas` through `areaId -> posAreas.id`
- `posAreas` belong to `posLocations` through `locationId -> posLocations.id`

### Staff and Users
- `posStaff` are linked to `users` through `userId -> users.id`
- `posStaff` belong to `posLocations` through `locationId -> posLocations.id`

### Shifts
- `posShifts` belong to `posStaff` through `staffId -> posStaff.id`
- `posShifts` belong to `posLocations` through `locationId -> posLocations.id`

### Orders
- `posOrders` belong to `posLocations` through `locationId -> posLocations.id`
- `posOrders` may belong to `posTables` through `tableId -> posTables.id`
- `posOrders` are associated with `posStaff` through `staffId -> posStaff.id`
- `posOrders` may be associated with customers through `customerId -> users.id`

### Order Items
- `posOrderItems` belong to `posOrders` through `orderId -> posOrders.id`
- `posOrderItems` are associated with `posMenuItems` through `menuItemId -> posMenuItems.id`

### Payments
- `posPayments` belong to `posOrders` through `orderId -> posOrders.id`
- `posPayments` may be associated with `posStaff` through `staffId -> posStaff.id`

### Discounts
- `posDiscounts` belong to `posLocations` through `locationId -> posLocations.id`

### Inventory Transactions
- `posInventoryTransactions` belong to `posLocations` through `locationId -> posLocations.id`
- `posInventoryTransactions` belong to `posInventoryItems` through `inventoryItemId -> posInventoryItems.id`
- `posInventoryTransactions` may be associated with `posOrders` through `orderId -> posOrders.id`
- `posInventoryTransactions` may be associated with `posVendors` through `vendorId -> posVendors.id`
- `posInventoryTransactions` may be associated with `posStaff` through `staffId -> posStaff.id`

### Reservations
- `posReservations` belong to `posLocations` through `locationId -> posLocations.id`
- `posReservations` belong to `posTables` through `tableId -> posTables.id`

### Daily Totals
- `posDailyTotals` belong to `posLocations` through `locationId -> posLocations.id`

This document shows the key relationships between the main entities in the BistroBeast POS system.
