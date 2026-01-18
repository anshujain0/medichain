// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MedicineSupplyChain {
    struct Medicine {
        string name;
        string manufacturer;
        address currentHolder;
        bool isDelivered;
    }

    mapping(uint256 => Medicine) private medicines;
    event MedicineCreated(string name, uint256 batchNumber, string manufacturer, address createdBy);
    event MedicineTransferred(uint256 batchNumber, address from, address to);
    event DeliveryConfirmed(uint256 batchNumber);

    // Function to create a new medicine
    function createMedicine(string calldata _name, uint256 _batchNumber, string calldata _manufacturer) external {
        require(_batchNumber > 0, "Batch number must be greater than zero");
        require(medicines[_batchNumber].currentHolder == address(0), "Medicine with this batch number already exists");

        medicines[_batchNumber] = Medicine({
            name: _name,
            manufacturer: _manufacturer,
            currentHolder: msg.sender,
            isDelivered: false
        });

        emit MedicineCreated(_name, _batchNumber, _manufacturer, msg.sender);
    }

    // Function to transfer medicine ownership
    function transferMedicine(uint256 _batchNumber, address _newHolder) external {
        require(_newHolder != address(0), "New holder cannot be the zero address");
        require(medicines[_batchNumber].currentHolder != address(0), "Medicine does not exist");
        require(medicines[_batchNumber].currentHolder == msg.sender, "Only the current holder can transfer the medicine");
        require(_newHolder != msg.sender, "New holder cannot be the same as the current holder");

        medicines[_batchNumber].currentHolder = _newHolder;

        emit MedicineTransferred(_batchNumber, msg.sender, _newHolder);
    }

    // Function to confirm delivery of medicine
    function confirmDelivery(uint256 _batchNumber) external {
        require(medicines[_batchNumber].currentHolder != address(0), "Medicine does not exist");
        require(medicines[_batchNumber].currentHolder == msg.sender, "Only the current holder can confirm delivery");
        require(!medicines[_batchNumber].isDelivered, "Delivery is already confirmed");

        medicines[_batchNumber].isDelivered = true;

        emit DeliveryConfirmed(_batchNumber);
    }

    // Function to get medicine details
    function getMedicine(uint256 _batchNumber)
        external
        view
        returns (string memory name, string memory manufacturer, address currentHolder, bool isDelivered)
    {
        require(medicines[_batchNumber].currentHolder != address(0), "Medicine does not exist");

        Medicine memory med = medicines[_batchNumber];
        return (med.name, med.manufacturer, med.currentHolder, med.isDelivered);
    }
}