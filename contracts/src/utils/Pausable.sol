// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title Pausable
 * @dev Permite pausar y reanudar funciones del contrato
 */
abstract contract Pausable is Ownable {
    bool private _paused;
    
    event Paused(address account);
    event Unpaused(address account);
    
    // Constructor que llama al constructor de Ownable con el msg.sender
    constructor() Ownable(msg.sender) {
        _paused = false;
    }
    
    modifier whenNotPaused() {
        require(!_paused, "Pausable: paused");
        _;
    }
    
    modifier whenPaused() {
        require(_paused, "Pausable: not paused");
        _;
    }
    
    function paused() public view virtual returns (bool) {
        return _paused;
    }
    
    function _pause() internal virtual whenNotPaused {
        _paused = true;
        emit Paused(msg.sender);
    }
    
    function _unpause() internal virtual whenPaused {
        _paused = false;
        emit Unpaused(msg.sender);
    }
}