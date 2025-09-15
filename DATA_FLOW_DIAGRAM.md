# Data Flow Diagram: Add Jobs Form

```mermaid
graph TD
    A[User fills addjobs form] --> B[Form with dynamic rows]
    B --> C[Submit form]
    
    C --> D[Browser sends POST request]
    D --> E[req.body contains form data]
    
    E --> F[Routes/add.js POST /jobs/:id]
    F --> G[Extract simple fields]
    F --> H[Extract array fields]
    
    G --> I[termen_executie, kilometri, tarif_ora]
    H --> J[lucrari_sol[], def_suplimentare[]]
    H --> K[den_piesa_cl[] + buc_piesa_cl[] pairs]
    H --> L[denum_operatie[] + timp_operatie[] pairs]
    H --> M[denum_piesa[] + cant_piese[] + pret_piesa[] triplets]
    
    I --> N[Direct use in query]
    J --> O[collectStructuredData]
    K --> P[collectPairedData]
    L --> Q[collectPairedData]
    M --> R[collectTripleData]
    
    O --> S[Filter empty values]
    P --> S
    Q --> S
    R --> S
    
    S --> T[prepareForStorage]
    T --> U[Convert arrays to JSON strings]
    U --> V[Create query parameters]
    
    V --> W[Database INSERT query]
    W --> X[Data stored in jobs table]
    X --> Y[Redirect to profile view]
    
    style A fill:#e1f5fe
    style B fill:#e1f5fe
    style C fill:#e1f5fe
    style D fill:#f3e5f5
    style E fill:#f3e5f5
    style F fill:#e8f5e8
    style G fill:#e8f5e8
    style H fill:#e8f5e8
    style I fill:#fff3e0
    style J fill:#fff3e0
    style K fill:#fff3e0
    style L fill:#fff3e0
    style M fill:#fff3e0
    style O fill:#fce4ec
    style P fill:#fce4ec
    style Q fill:#fce4ec
    style R fill:#fce4ec
    style S fill:#f1f8e9
    style T fill:#f1f8e9
    style U fill:#f1f8e9
    style V fill:#e0f2f1
    style W fill:#e0f2f1
    style X fill:#e0f2f1
    style Y fill:#e1f5fe
    
    classDef client fill:#e1f5fe,stroke:#333;
    classDef network fill:#f3e5f5,stroke:#333;
    classDef server fill:#e8f5e8,stroke:#333;
    classDef extraction fill:#fff3e0,stroke:#333;
    classDef processing fill:#fce4ec,stroke:#333;
    classDef preparation fill:#f1f8e9,stroke:#333;
    classDef storage fill:#e0f2f1,stroke:#333;
    classDef response fill:#e1f5fe,stroke:#333;
```

This diagram shows the complete flow from user interaction to data storage:

1. **Client Side** (light blue): User fills the form with dynamic rows
2. **Network** (purple): Browser sends POST request with form data
3. **Server Route** (light green): Add.js route receives the request
4. **Data Extraction** (light orange): Simple fields and array fields are extracted
5. **Data Processing** (pink): Utility functions filter and process array data
6. **Data Preparation** (light green): Arrays are converted to JSON strings
7. **Database Storage** (teal): Data is inserted into the jobs table
8. **Response** (light blue): User is redirected to profile view

The key components are:
- Dynamic form rows with array notation names
- Data processing utilities that filter empty values
- JSON serialization for array storage
- Proper error handling and default values