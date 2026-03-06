package com.example.librarymanagement.controller;

import com.example.librarymanagement.entity.Inventory;
import com.example.librarymanagement.service.InventoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/inventory")
public class InventoryController {
    @Autowired private InventoryService inventoryService;

    @PostMapping public Inventory add(@RequestBody Inventory inv) { return inventoryService.addInventory(inv); }
    @GetMapping public List<Inventory> getAll() { return inventoryService.getAllInventory(); }
    @PutMapping("/{id}") public Inventory update(@PathVariable int id, @RequestBody Inventory inv) { return inventoryService.updateInventory(id, inv); }
}