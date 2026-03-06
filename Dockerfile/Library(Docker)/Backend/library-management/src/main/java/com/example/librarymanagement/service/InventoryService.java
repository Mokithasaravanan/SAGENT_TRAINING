package com.example.librarymanagement.service;

import com.example.librarymanagement.entity.Inventory;
import com.example.librarymanagement.repository.InventoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class InventoryService {
    @Autowired private InventoryRepository inventoryRepository;

    public Inventory addInventory(Inventory inv) { return inventoryRepository.save(inv); }
    public List<Inventory> getAllInventory() { return inventoryRepository.findAll(); }
    public Inventory updateInventory(int id, Inventory updated) {
        Inventory inv = inventoryRepository.findById(id).orElse(null);
        if (inv == null) return null;
        inv.setTotalCopies(updated.getTotalCopies());
        inv.setAvailableCopies(updated.getAvailableCopies());
        inv.setLostCopies(updated.getLostCopies());
        inv.setDamagedCopies(updated.getDamagedCopies());
        inv.setLastUpdated(updated.getLastUpdated());
        return inventoryRepository.save(inv);
    }
}