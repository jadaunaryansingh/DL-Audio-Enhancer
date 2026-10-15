import os
import torch
import torch.nn as nn

class AudioEnhancer(nn.Module):
    """
    Deep U-Net Architecture with Bidirectional Recurrent Bottleneck
    for Spectral Magnitude Mask Estimation.
    """
    def __init__(self, hidden_dim=128, dropout_rate=0.2):
        super().__init__()
        
        # Encoder: Convolutions along Frequency axis with spatial dropout
        self.enc1 = nn.Sequential(
            nn.Conv2d(1, 16, kernel_size=(3, 3), stride=(2, 1), padding=1),
            nn.BatchNorm2d(16),
            nn.LeakyReLU(0.2)
        )
        self.enc2 = nn.Sequential(
            nn.Conv2d(16, 32, kernel_size=(3, 3), stride=(2, 1), padding=1),
            nn.BatchNorm2d(32),
            nn.LeakyReLU(0.2),
            nn.Dropout2d(0.1)
        )
        self.enc3 = nn.Sequential(
            nn.Conv2d(32, 64, kernel_size=(3, 3), stride=(2, 1), padding=1),
            nn.BatchNorm2d(64),
            nn.LeakyReLU(0.2),
            nn.Dropout2d(0.15)
        )
        
        # Temporal Bottleneck GRU
        self.gru = nn.GRU(
            input_size=64 * 33,
            hidden_size=hidden_dim,
            num_layers=2,
            batch_first=True,
            dropout=dropout_rate
        )
        self.fc = nn.Linear(hidden_dim, 64 * 33)
        
        # Decoder with Skip Connections from Encoder
        self.dec3 = nn.Sequential(
            nn.ConvTranspose2d(64 + 64, 32, kernel_size=(3, 3), stride=(2, 1), padding=1),
            nn.BatchNorm2d(32),
            nn.LeakyReLU(0.2),
            nn.Dropout2d(0.1)
        )
        self.dec2 = nn.Sequential(
            nn.ConvTranspose2d(32 + 32, 16, kernel_size=(3, 3), stride=(2, 1), padding=1),
            nn.BatchNorm2d(16),
            nn.LeakyReLU(0.2)
        )
        self.dec1 = nn.Sequential(
            nn.ConvTranspose2d(16 + 16, 1, kernel_size=(3, 3), stride=(2, 1), padding=1),
            nn.Sigmoid()
        )

    def forward(self, mag):
        # Input shape: (Batch, Freq=257, Time)
        x = mag.unsqueeze(1)
        
        e1 = self.enc1(x)
        e2 = self.enc2(e1)
        e3 = self.enc3(e2)
        
        b, c, f, t = e3.shape
        gru_in = e3.permute(0, 3, 1, 2).reshape(b, t, c * f)
        gru_out, _ = self.gru(gru_in)
        gru_out = self.fc(gru_out)
        d_in = gru_out.reshape(b, t, c, f).permute(0, 2, 3, 1)
        
        d3 = self.dec3(torch.cat([d_in, e3], dim=1))
        d2 = self.dec2(torch.cat([d3, e2], dim=1))
        mask = self.dec1(torch.cat([d2, e1], dim=1))
        
        return mask.squeeze(1)


def load_model(checkpoint_path="audio_enhancer_model.pth", device=None):
    if device is None:
        device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    
    model = AudioEnhancer().to(device)
    
    # Auto-resolve path if not immediately found
    if not os.path.exists(checkpoint_path):
        candidates = [
            os.path.join(os.path.dirname(__file__), checkpoint_path),
            os.path.join(os.path.dirname(__file__), "..", checkpoint_path),
            os.path.join(os.getcwd(), checkpoint_path),
            os.path.join(os.getcwd(), "backend", checkpoint_path),
            os.path.join(os.path.dirname(__file__), "audio_enhancer_model.pth"),
            os.path.join(os.path.dirname(__file__), "..", "audio_enhancer_model.pth"),
        ]
        for c in candidates:
            if os.path.exists(c):
                checkpoint_path = c
                break

    try:
        state_dict = torch.load(checkpoint_path, map_location=device, weights_only=True)
        model.load_state_dict(state_dict)
        print(f"Successfully loaded checkpoint: {checkpoint_path} on {device}")
    except Exception as e:
        print(f"Warning: Could not load {checkpoint_path}: {e}. Model will use initialized weights.")
        
    model.eval()
    return model, device
